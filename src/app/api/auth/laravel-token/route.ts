import axios from "axios";
import https from "https";
import { NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/env";
import {
  redactSensitiveUrl,
  serializeUnknownError,
} from "@/lib/upstreamRequestError";

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const direct =
    (typeof p.access_token === "string" && p.access_token) ||
    (typeof p.token === "string" && p.token);
  if (direct) return direct;
  const data = p.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.access_token === "string") return d.access_token;
    if (typeof d.token === "string") return d.token;
  }
  return null;
}

/**
 * Server-only token bootstrap: calls Laravel `GET /api/get-token` (optional `API_APP_SECRET` as query param).
 *
 * Uses Axios so TLS errors include `code` (e.g. UNABLE_TO_VERIFY_LEAF_SIGNATURE) and optional
 * `API_TLS_INSECURE=1` for self-signed HTTPS on a trusted LAN (prefer HTTP or a real CA when possible).
 */
export async function GET() {
  let base: string;
  try {
    base = getServerApiBaseUrl();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Configuration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const secret = process.env.API_APP_SECRET;
  const url = new URL(`${base}/get-token`);
  url.searchParams.set("is_super_user", "1");
  if (secret) {
    url.searchParams.set("app_secret", secret);
  }

  try {
    const tlsInsecure = process.env.API_TLS_INSECURE === "1";

    const res = await axios.get<string>(url.toString(), {
      responseType: "text",
      transitional: { forcedJSONParsing: false },
      headers: { Accept: "application/json" },
      httpsAgent: tlsInsecure
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined,
      validateStatus: () => true,
      timeout: 30_000,
    });

    const raw = res.data;
    let json: unknown = null;
    if (raw) {
      try {
        json = JSON.parse(raw) as unknown;
      } catch {
        return NextResponse.json(
          {
            error: "Laravel returned non-JSON (check API URL, TLS, and Laravel logs)",
            laravelStatus: res.status,
            preview: raw.slice(0, 400),
            targetUrl: redactSensitiveUrl(url),
          },
          { status: 502 },
        );
      }
    }
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(
        {
          error: "Token request failed",
          detail: json,
          targetUrl: redactSensitiveUrl(url),
        },
        { status: res.status },
      );
    }
    const token = extractToken(json);
    if (!token) {
      return NextResponse.json(
        {
          error: "Could not parse token from Laravel response",
          detail: json,
          targetUrl: redactSensitiveUrl(url),
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ token });
  } catch (e) {
    const hints = [
      `From this server, run: curl -v ${redactSensitiveUrl(url)}`,
      "HTTPS + self-signed cert: set API_TLS_INSECURE=1 on the Next process (trusted LAN only), use NODE_EXTRA_CA_CERTS, or point API_BASE_URL to http:// for internal calls.",
      "ECONNREFUSED / ETIMEDOUT: Laravel not reachable from this host, wrong port, or firewall.",
    ];
    return NextResponse.json(
      {
        error: "Could not reach Laravel (network/TLS).",
        targetUrl: redactSensitiveUrl(url),
        detail: serializeUnknownError(e),
        hints,
      },
      { status: 502 },
    );
  }
}
