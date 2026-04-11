import fs from "fs";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logsDir = path.join(process.cwd(), "logs");

let accessLogger: winston.Logger | null = null;
let errorLogger: winston.Logger | null = null;

function ensureLoggers(): void {
  if (accessLogger && errorLogger) return;
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  );
  accessLogger = winston.createLogger({
    level: "info",
    transports: [
      new DailyRotateFile({
        dirname: logsDir,
        filename: "access-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "2d",
        format: jsonFormat,
      }),
    ],
  });
  errorLogger = winston.createLogger({
    level: "error",
    transports: [
      new DailyRotateFile({
        dirname: logsDir,
        filename: "error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "2d",
        format: jsonFormat,
      }),
    ],
  });
}

/** One JSON line per incoming request (success path through proxy). */
export function logIncomingRequest(request: {
  method: string;
  nextUrl: URL;
  headers: Headers;
}): void {
  ensureLoggers();
  const h = request.headers;
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
  accessLogger!.info({
    kind: "request",
    outcome: "received",
    method: request.method,
    path: request.nextUrl.pathname,
    search: request.nextUrl.search || undefined,
    ip,
    userAgent: h.get("user-agent") || undefined,
  });
}

/**
 * Billing-backend login proxy diagnostics (no credentials or response bodies).
 * Use to verify data from the client reaches Next (`rawIncomingBodyBytes`) and matches what is
 * forwarded upstream (`forwardedBodyBytes`), plus upstream status and transport errors.
 * Login: `upstreamPayloadRedacted` is JSON with secrets redacted (see `proxyRequestToUrl.ts`).
 */
export function logLoginProxyEvent(
  entry: Record<string, unknown>,
): void {
  ensureLoggers();
  accessLogger!.info({
    kind: "login_proxy",
    ...entry,
  });
}

/** Any billing proxy: failed to read the incoming request body (client → Next). */
export function logProxyBodyReadFailure(
  entry: Record<string, unknown>,
): void {
  ensureLoggers();
  errorLogger!.error({
    kind: "proxy_body_read",
    outcome: "incoming_body_error",
    ...entry,
  });
}

/**
 * Any billing proxy: upstream request threw (network, TLS, timeout) before a normal HTTP response.
 * `kind` is `login_proxy` when `isLoginPath` is true (easier to grep).
 */
export function logProxyUpstreamFailure(
  entry: Record<string, unknown> & { isLoginPath?: boolean },
): void {
  ensureLoggers();
  const { isLoginPath, ...rest } = entry;
  errorLogger!.error({
    kind: isLoginPath ? "login_proxy" : "proxy_upstream",
    outcome: "upstream_or_transport_error",
    ...(rest as Record<string, unknown>),
  });
}

/** Route handler: API base URL / origin env not configured. */
export function logBillingProxyEnvMissing(
  entry: Record<string, unknown> & {
    route: "billing-backend" | "billing-api" | "sanctum-csrf";
  },
): void {
  ensureLoggers();
  errorLogger!.error({
    kind: "billing_proxy_env",
    outcome: "missing_configuration",
    ...entry,
  });
}

/**
 * Server-side `loginRequest` only (SSR / loopback): validation, network, parse, HTTP errors.
 * Never log credentials or response bodies.
 */
export function logLoginFlowError(
  entry: Record<string, unknown>,
): void {
  ensureLoggers();
  errorLogger!.error({
    kind: "login_flow",
    ...entry,
  });
}

/** Server-side errors (RSC, route handlers, actions, proxy) from Next instrumentation. */
export function logServerError(
  err: Error & { digest?: string },
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
  },
  context: Record<string, unknown>,
): void {
  ensureLoggers();
  errorLogger!.error({
    kind: "server_error",
    outcome: "error",
    message: err.message,
    name: err.name,
    digest: err.digest,
    stack: err.stack,
    request: {
      path: request.path,
      method: request.method,
    },
    context,
  });
}
