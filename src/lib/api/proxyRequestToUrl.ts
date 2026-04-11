import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getBillingBackendHttpsAgent } from "@/lib/api/nodeTlsAgent";

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

/** Do not forward Next/Vercel/internal hop headers — they confuse the upstream API and differ from `billing-token` (minimal headers). */
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
    data = await req.arrayBuffer();
  }

  const forwardHeaders = collectForwardHeaders(req, targetUrl);

  const incomingContentType = req.headers.get("content-type") ?? "";

  // Empty POST/PUT/PATCH: only synthesize `{}` when the client is *not* sending JSON. For
  // `application/json`, forwarding a fake `{}` makes the backend think credentials were omitted
  // (`samaccountname` / `password` required) if the real body was lost upstream.
  if (
    ["POST", "PUT", "PATCH"].includes(method) &&
    (!data || data.byteLength === 0) &&
    !incomingContentType.includes("application/json")
  ) {
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

  try {
    const res = await axios.request<ArrayBuffer>({
      url: targetUrl,
      method,
      headers: forwardHeaders,
      data: bodyBuffer,
      responseType: "arraybuffer",
      validateStatus: () => true,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      decompress: true,
      httpsAgent: agent,
      /**
       * `follow-redirects` (used by Axios in Node) follows 302/303 by resubmitting as GET, so the backend
       * may see GET on `api/backend/logout` and return MethodNotAllowedHttpException. Preserve method
       * and body on redirect hops (nginx/http→https, trailing slash, etc.).
       */
      beforeRedirect: (options) => {
        if (agent) options.httpsAgent = agent;
        if (!["GET", "HEAD"].includes(method)) {
          options.method = method;
          if (bodyBuffer?.length) options.data = bodyBuffer;
          else if (
            ["POST", "PUT", "PATCH"].includes(method) &&
            !incomingContentType.includes("application/json")
          ) {
            options.data = Buffer.from("{}");
          }
        }
      },
      timeout: 120_000,
    });
    return buildNextResponse(res, rewrite);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Upstream request failed", detail: message },
      { status: 502 },
    );
  }
}
