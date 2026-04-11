"use client";

import { toast } from "react-toastify";
import { parseBillingBackendApiError } from "@/lib/api/parseBillingBackendApiError";

type ToastKind = "success" | "error" | "info" | "warning";

const toastSurface = {
  className: "!rounded-xl !border !border-zinc-700/80 !bg-zinc-900 !text-zinc-100 !shadow-lg",
  bodyClassName: "!text-sm",
};

function mapKind(kind: ToastKind) {
  switch (kind) {
    case "success":
      return toast.success;
    case "error":
      return toast.error;
    case "warning":
      return toast.warning;
    default:
      return toast.info;
  }
}

/** Generic app toast (success / error / info / warning). */
export function showAppToast(message: string, kind: ToastKind = "info"): void {
  mapKind(kind)(message, { ...toastSurface });
}

/** Billing backend validation + API errors from Axios (422 `errors`, `message`, …). */
export function showBillingBackendErrorToast(error: unknown): void {
  const { messages, headline } = parseBillingBackendApiError(error);
  const lines = messages.length > 0 ? messages : [headline];

  if (lines.length <= 1) {
    toast.error(lines[0], { ...toastSurface, autoClose: 8000 });
    return;
  }

  toast.error(
    <ul className="list-inside list-disc space-y-0.5 text-left">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>,
    { ...toastSurface, autoClose: 8000 },
  );
}
