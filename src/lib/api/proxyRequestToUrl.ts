import axios from "axios";
import type { AxiosResponse } from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getBillingBackendHttpsAgent } from "@/lib/api/nodeTlsAgent";
import {
  logLoginProxyEvent,
  logProxyBodyReadFailure,
  logProxyUpstreamFailure,
} from "@/lib/httpRequestFileLogger";

/**
 * When the billing backend returns 30x with `Location: https://upstream-host/api/...`, the browser would follow
 * that URL and leave the Next proxy — TLS is then enforced in the browser (`ERR_CERT_*`), and Node’s
 * `https.Agent` does not apply. Rewrite `Location` to stay under `/api/billing-backend` or `/api/billing-api`.
 */
export type BillingBackendProxyRewrite = {
  upstreamBaseUrl: string;
  nextPrefix: string;
};

function rewriteLocationHeader(
  headers: Headers,
  status: number,
  rewrite: BillingBackendProxyRewrite,
): void {
  if (status < 300 || status >= 400) return;
  const loc = headers.get("location");
  if (!loc) return;

  try {
    const base = new URL(rewrite.upstreamBaseUrl.replace(/\/$/, ""));
    const abs = new URL(loc, base);

    if (abs.origin !== base.origin) return;

    const basePath = base.pathname.replace(/\/$/, "") || "";
    const p = abs.pathname;
    if (!p.startsWith(basePath)) return;

    const rest = p.slice(basePath.length);
    const pathPart =
      rest === "" || rest === "/"
        ? ""
        : rest.startsWith("/")
          ? rest
          : `/${rest}`;
    const prefix = rewrite.nextPrefix.replace(/\/$/, "");
    const nextLoc = `${prefix}${pathPart}${abs.search}${abs.hash}`;
    headers.set("location", nextLoc);
  } catch {
    /* leave Location unchanged */
  }
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/** Do not forward Next/Vercel/internal hop headers — they confuse the upstream API. */
const HEADER_PREFIX_DROP = [
  "x-nextjs-",
  "x-vercel-",
  "x-middleware-",
  "x-invoke-",
  "x-forwarded-", // replaced with values derived from this request
  "next-router",
];

function collectForwardHeaders(
  req: NextRequest,
  targetUrl: string,
): Record<string, string> {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    if (HEADER_PREFIX_DROP.some((p) => lower.startsWith(p))) return;
    headers[key] = value;
  });

  const upstream = new URL(targetUrl);
  headers.Host = upstream.host;

  const proto = req.nextUrl.protocol.replace(":", "") || "https";
  headers["X-Forwarded-Proto"] = proto;

  const host = req.headers.get("host");
  if (host) headers["X-Forwarded-Host"] = host;

  const xff =
    req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  headers["X-Forwarded-For"] = xff?.trim() || "127.0.0.1";

  return headers;
}

function safeUrlPathname(url: string): string | undefined {
  try {
    return new URL(url).pathname;
  } catch {
    return undefined;
  }
}

function isBillingLoginPath(targetUrl: string): boolean {
  const p = safeUrlPathname(targetUrl);
  if (!p) return false;
  return p === "/login" || p.endsWith("/login");
}

/** Axios uses `follow-redirects`, which turns POST into GET and drops the body on 301/302 — Laravel then sees an empty payload. */
const MAX_UPSTREAM_REDIRECT_HOPS = 5;

function removeHeaderCaseInsensitive(
  headers: Record<string, string>,
  name: string,
): void {
  const lower = name.toLowerCase();
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === lower) {
      delete headers[k];
    }
  }
}

function setHostHeaderForUrl(
  headers: Record<string, string>,
  absoluteUrl: string,
): void {
  try {
    headers.Host = new URL(absoluteUrl).host;
  } catch {
    /* leave Host unchanged */
  }
}

function getRedirectLocation(res: AxiosResponse<unknown>): string | undefined {
  const h = res.headers as Record<string, unknown>;
  const loc = h["location"] ?? h["Location"];
  if (Array.isArray(loc)) return loc[0] ? String(loc[0]) : undefined;
  if (loc == null) return undefined;
  return String(loc);
}

function buildUpstreamHeaders(
  forwardHeaders: Record<string, string>,
  incomingContentType: string,
  bodyBuffer: Buffer | undefined,
): Record<string, string> {
  const headers: Record<string, string> = { ...forwardHeaders };
  if (!bodyBuffer?.length) return headers;
  removeHeaderCaseInsensitive(headers, "content-type");
  removeHeaderCaseInsensitive(headers, "content-length");
  const ct =
    incomingContentType && incomingContentType.toLowerCase().includes("application/json")
      ? incomingContentType
      : "application/json; charset=utf-8";
  headers["Content-Type"] = ct;
  headers["Content-Length"] = String(bodyBuffer.length);
  return headers;
}

/** Keys whose values must never appear verbatim in logs. */
function isSensitiveJsonKey(key: string): boolean {
  const k = key.toLowerCase();
  if (
    k === "password" ||
    k === "pass" ||
    k === "passwd" ||
    k === "token" ||
    k === "access_token" ||
    k === "refresh_token" ||
    k === "secret" ||
    k === "client_secret" ||
    k === "authorization"
  ) {
    return true;
  }
  if (k.includes("password")) return true;
  if (k.includes("token") && k !== "token_type") return true;
  return false;
}

function redactJsonForLog(parsed: unknown): unknown {
  if (parsed === null) return null;
  if (Array.isArray(parsed)) {
    return parsed.map((item) => redactJsonForLog(item));
  }
  if (typeof parsed !== "object") return parsed;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (isSensitiveJsonKey(k)) {
      out[k] =
        typeof v === "string" && v.length > 0
          ? `[REDACTED len=${v.length}]`
          : "[REDACTED]";
    } else if (v !== null && typeof v === "object") {
      out[k] = redactJsonForLog(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Safe snapshot of the JSON body sent upstream (passwords/tokens redacted).
 * Returns `undefined` if body is empty or not JSON.
 */
function buildRedactedUpstreamPayloadJson(
  bodyBuffer: Buffer | undefined,
  contentType: string,
): { upstreamPayloadRedacted?: string; upstreamPayloadLogNote?: string } {
  if (!bodyBuffer?.length) {
    return { upstreamPayloadLogNote: "empty_body" };
  }
  if (!contentType.toLowerCase().includes("application/json")) {
    return { upstreamPayloadLogNote: "non_json_content_type" };
  }
  let text: string;
  try {
    text = bodyBuffer.toString("utf8");
  } catch {
    return { upstreamPayloadLogNote: "body_not_utf8" };
  }
  try {
    const parsed: unknown = JSON.parse(text);
    const redacted = redactJsonForLog(parsed);
    return {
      upstreamPayloadRedacted: JSON.stringify(redacted),
    };
  } catch {
    return { upstreamPayloadLogNote: "json_parse_failed" };
  }
}

function buildNextResponse(
  ax: import("axios").AxiosResponse<ArrayBuffer>,
  rewrite?: BillingBackendProxyRewrite,
): NextResponse {
  const resHeaders = new Headers();
  const raw = ax.headers;
  const setCookie = raw["set-cookie"];
  if (setCookie) {
    const list = Array.isArray(setCookie) ? setCookie : [String(setCookie)];
    for (const c of list) {
      if (c) resHeaders.append("set-cookie", c);
    }
  }
  for (const [k, v] of Object.entries(raw)) {
    if (k.toLowerCase() === "set-cookie") continue;
    const kl = k.toLowerCase();
    // Axios may decompress the body but leave encoding headers — browsers must not get a mismatch.
    if (kl === "content-encoding" || kl === "transfer-encoding") continue;
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) resHeaders.set(k, v.join(", "));
    else if (typeof v === "string") resHeaders.set(k, v);
  }
  if (rewrite) {
    rewriteLocationHeader(resHeaders, ax.status, rewrite);
  }
  const body = ax.data?.byteLength ? new Uint8Array(ax.data) : null;
  return new NextResponse(body, { status: ax.status, headers: resHeaders });
}

/**
 * Forwards the incoming request to a full upstream URL (used by billing backend proxy routes).
 * Uses the shared TLS agent when `API_TLS_INSECURE=1`.
 */
export async function proxyRequestToUrl(
  req: NextRequest,
  targetUrl: string,
  rewrite?: BillingBackendProxyRewrite,
): Promise<NextResponse> {
  const method = (req.method || "GET").toUpperCase();
  const agent = getBillingBackendHttpsAgent();

  let data: ArrayBuffer | undefined;
  if (!["GET", "HEAD"].includes(method)) {
    try {
      data = await req.arrayBuffer();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      logProxyBodyReadFailure({
        method,
        nextClientPath: req.nextUrl.pathname,
        upstreamPath: safeUrlPathname(targetUrl),
        targetUrlInvalid: safeUrlPathname(targetUrl) === undefined,
        message,
        name: e instanceof Error ? e.name : undefined,
      });
      return NextResponse.json(
        { error: "Failed to read request body" },
        { status: 400 },
      );
    }
  }

  /** Bytes read from the incoming Next request (outside → Node) before any body synthesis. */
  const rawIncomingBodyBytes = data?.byteLength ?? 0;

  const forwardHeaders = collectForwardHeaders(req, targetUrl);

  const incomingContentType = req.headers.get("content-type") ?? "";
  const incomingContentLength = req.headers.get("content-length");

  // Empty POST/PUT/PATCH: only synthesize `{}` when the client is *not* sending JSON. For
  // `application/json`, forwarding a fake `{}` makes the backend think credentials were omitted
  // (`samaccountname` / `password` required) if the real body was lost upstream.
  let synthesizedEmptyJson = false;
  if (
    ["POST", "PUT", "PATCH"].includes(method) &&
    (!data || data.byteLength === 0) &&
    !incomingContentType.includes("application/json")
  ) {
    synthesizedEmptyJson = true;
    data = new TextEncoder().encode("{}").buffer;
    if (
      !Object.keys(forwardHeaders).some(
        (k) => k.toLowerCase() === "content-type",
      )
    ) {
      forwardHeaders["Content-Type"] = "application/json";
    }
  }

  const bodyBuffer =
    data && data.byteLength > 0 ? Buffer.from(data) : undefined;
  const forwardedBodyBytes = bodyBuffer?.length ?? 0;

  const loginTrace = isBillingLoginPath(targetUrl);
  if (loginTrace) {
    const h = req.headers;
    const xff = h.get("x-forwarded-for") ?? h.get("x-real-ip");
    const clientIp =
      xff?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
    const payloadLog = buildRedactedUpstreamPayloadJson(
      bodyBuffer,
      incomingContentType,
    );
    logLoginProxyEvent({
      phase: "init_login_incoming",
      method,
      /** Path the browser / caller used on this app (outside → Next). */
      nextClientPath: req.nextUrl.pathname,
      nextClientSearch: req.nextUrl.search || undefined,
      clientIp,
      userAgent: h.get("user-agent") || undefined,
      rawIncomingBodyBytes,
      incomingContentLength: incomingContentLength ?? undefined,
      contentLengthMatchesRead:
        incomingContentLength != null &&
        incomingContentLength !== "" &&
        Number.parseInt(incomingContentLength, 10) === rawIncomingBodyBytes,
      contentType: incomingContentType || undefined,
      hasJsonContentType: incomingContentType.includes("application/json"),
      synthesizedEmptyJson,
      /** Bytes sent upstream (should match raw when JSON login body arrived intact). */
      forwardedBodyBytes,
      upstreamPath: safeUrlPathname(targetUrl),
      forwardingMatchesIncoming:
        !synthesizedEmptyJson && forwardedBodyBytes === rawIncomingBodyBytes,
      /**
       * Same JSON Laravel receives; passwords/tokens are redacted (never log secrets verbatim).
       * Example: `{"samaccountname":"jdoe","password":"[REDACTED len=12]","is_super_user":1}`
       */
      ...payloadLog,
    });
  }

  try {
    const upstreamHeaders = buildUpstreamHeaders(
      forwardHeaders,
      incomingContentType,
      bodyBuffer,
    );

    let currentUrl = targetUrl;
    let res!: AxiosResponse<ArrayBuffer>;

    for (let hop = 0; hop <= MAX_UPSTREAM_REDIRECT_HOPS; hop++) {
      setHostHeaderForUrl(upstreamHeaders, currentUrl);

      res = await axios.request<ArrayBuffer>({
        url: currentUrl,
        method,
        headers: upstreamHeaders,
        data: bodyBuffer,
        responseType: "arraybuffer",
        validateStatus: () => true,
        maxRedirects: 0,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        decompress: true,
        httpsAgent: agent,
        timeout: 120_000,
      });

      const loc = getRedirectLocation(res);
      if (
        res.status >= 300 &&
        res.status < 400 &&
        loc &&
        hop < MAX_UPSTREAM_REDIRECT_HOPS
      ) {
        try {
          const nextUrl = new URL(loc, currentUrl).href;
          if (loginTrace) {
            let fromHost: string | undefined;
            let toHost: string | undefined;
            try {
              fromHost = new URL(currentUrl).host;
            } catch {
              fromHost = undefined;
            }
            try {
              toHost = new URL(nextUrl).host;
            } catch {
              toHost = undefined;
            }
            logLoginProxyEvent({
              phase: "upstream_redirect_follow",
              hop,
              redirectStatus: res.status,
              fromHost,
              toHost,
            });
          }
          currentUrl = nextUrl;
          continue;
        } catch {
          break;
        }
      }
      break;
    }

    if (loginTrace) {
      const rb = res.data?.byteLength ?? 0;
      logLoginProxyEvent({
        phase: "upstream_response",
        method,
        upstreamPath: safeUrlPathname(currentUrl),
        upstreamStatus: res.status,
        responseBytes: rb,
        httpError: res.status >= 400,
      });
    }
    return buildNextResponse(res, rewrite);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logProxyUpstreamFailure({
      isLoginPath: loginTrace,
      method,
      nextClientPath: req.nextUrl.pathname,
      upstreamPath: safeUrlPathname(targetUrl),
      targetUrlInvalid: safeUrlPathname(targetUrl) === undefined,
      message,
      name: e instanceof Error ? e.name : undefined,
      ...(loginTrace
        ? { rawIncomingBodyBytes, forwardedBodyBytes }
        : {}),
    });
    return NextResponse.json(
      { error: "Upstream request failed", detail: message },
      { status: 502 },
    );
  }
}
