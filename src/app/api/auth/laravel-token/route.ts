import { NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/env";

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
 * Server-only token bootstrap: calls Laravel `GET /api/get-token` or `POST /api/get-token`
 * with `API_APP_SECRET` when set. Keeps secrets off the client.
 */
export async function POST() {
  try {
    const base = getServerApiBaseUrl();
    const secret = process.env.API_APP_SECRET;
    const url = new URL(`${base}/get-token`);
    url.searchParams.set("is_super_user", "1");

    const res = secret
      ? await fetch(url.toString(), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ app_secret: secret, is_super_user: 1 }),
        })
      : await fetch(url.toString(), {
          method: "GET",
          headers: { Accept: "application/json" },
        });

    const raw = await res.text();
    const json: unknown = raw ? JSON.parse(raw) : null;
    if (!res.ok) {
      return NextResponse.json(
        { error: "Token request failed", detail: json },
        { status: res.status },
      );
    }
    const token = extractToken(json);
    if (!token) {
      return NextResponse.json(
        { error: "Could not parse token from Laravel response", detail: json },
        { status: 502 },
      );
    }
    return NextResponse.json({ token });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
