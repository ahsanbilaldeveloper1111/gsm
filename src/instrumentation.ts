import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { applyInsecureNodeTlsFromEnv } = await import(
      "@/lib/api/applyInsecureNodeTls"
    );
    applyInsecureNodeTlsFromEnv();

    const { initLogsDir } = await import("./instrumentation.node");
    initLogsDir();
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logServerError } = await import("@/lib/httpRequestFileLogger");
  const error =
    err instanceof Error
      ? (err as Error & { digest?: string })
      : Object.assign(new Error(String(err)), {
          digest:
            err &&
            typeof err === "object" &&
            "digest" in err &&
            typeof (err as { digest: unknown }).digest === "string"
              ? (err as { digest: string }).digest
              : undefined,
        });
  logServerError(error, request, context as Record<string, unknown>);
};
