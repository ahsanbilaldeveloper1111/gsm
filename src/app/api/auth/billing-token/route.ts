import axios from "axios";
import { NextResponse } from "next/server";
import { getBillingBackendHttpsAgent } from "@/lib/api/nodeTlsAgent";
import { getInternalNextOrigin } from "@/lib/env";
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
 * Server-only token bootstrap: `GET /api/billing-api/get-token` → same proxy as the browser
 * (billing backend `GET /api/get-token`, optional `API_APP_SECRET` query param).
 */
export async function GET() {
  let url: URL;
  try {
    url = new URL(`${getInternalNextOrigin()}/api/billing-api/get-token`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Configuration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const secret = process.env.API_APP_SECRET;
  url.searchParams.set("is_super_user", "1");
  if (secret) {
    url.searchParams.set("app_secret", secret);
  }

  const targetUrl = url.toString();

  try {
    const res = await axios.get<string>(targetUrl, {
      responseType: "text",
      transitional: { forcedJSONParsing: false },
      headers: { Accept: "application/json" },
      httpsAgent: targetUrl.startsWith("https:")
        ? getBillingBackendHttpsAgent()
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
            error:
              "Billing backend returned non-JSON (check API URL, TLS, and server logs)",
            upstreamStatus: res.status,
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
          error: "Could not parse token from billing backend response",
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
      "Docker: set INTERNAL_NEXT_ORIGIN to this service’s reachable URL (e.g. http://frontend:3000).",
      "HTTPS + self-signed to billing backend: API_TLS_INSECURE=1 on Next (trusted LAN), or NODE_EXTRA_CA_CERTS, or HTTP for API_BASE_URL.",
      "ECONNREFUSED / ETIMEDOUT: wrong INTERNAL_NEXT_ORIGIN, billing backend host, port, or firewall.",
    ];
    return NextResponse.json(
      {
        error: "Could not reach billing backend (network/TLS).",
        targetUrl: redactSensitiveUrl(url),
        detail: serializeUnknownError(e),
        hints,
      },
      { status: 502 },
    );
  }
}
