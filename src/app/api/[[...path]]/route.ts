import type { NextRequest } from "next/server";
import { getServerApiBaseUrl } from "@/lib/env";
import { proxyRequestToUrl } from "@/lib/api/proxyRequestToUrl";
import { logBillingProxyEnvMissing } from "@/lib/httpRequestFileLogger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  let base: string;
  try {
    base = getServerApiBaseUrl();
  } catch (e) {
    logBillingProxyEnvMissing({
      route: "laravel-api",
      message: e instanceof Error ? e.message : String(e),
    });
    return Response.json(
      { error: "Server API URL not configured" },
      { status: 500 },
    );
  }
  const { path } = await context.params;
  const suffix = path?.length ? `/${path.join("/")}` : "";
  const search = new URL(req.url).search;
  const targetUrl = `${base.replace(/\/$/, "")}${suffix}${search}`;
  return proxyRequestToUrl(req, targetUrl, {
    upstreamBaseUrl: base.replace(/\/$/, ""),
    nextPrefix: "/api",
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
