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
