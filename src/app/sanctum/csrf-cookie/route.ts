import type { NextRequest } from "next/server";
import { getServerBillingBackendAppOrigin } from "@/lib/env";
import { proxyRequestToUrl } from "@/lib/api/proxyRequestToUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let origin: string;
  try {
    origin = getServerBillingBackendAppOrigin();
  } catch {
    return Response.json(
      { error: "Billing backend origin not configured" },
      { status: 500 },
    );
  }
  const search = new URL(req.url).search;
  const targetUrl = `${origin.replace(/\/$/, "")}/sanctum/csrf-cookie${search}`;
  return proxyRequestToUrl(req, targetUrl);
}
