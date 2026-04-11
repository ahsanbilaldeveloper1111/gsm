import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logIncomingRequest } from "@/lib/httpRequestFileLogger";

export function proxy(request: NextRequest): NextResponse {
  logIncomingRequest(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff2?)$).*)",
  ],
};
