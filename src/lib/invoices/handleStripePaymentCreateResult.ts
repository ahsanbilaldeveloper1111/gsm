import type { Stripe } from "@stripe/stripe-js";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import { showAppToast } from "@/lib/toast/appToast";

type CompletePaymentFn = (input: {
  payment_id: number;
  payment_method: string;
}) => Promise<unknown>;

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

/**
 * Handles backend payment create responses (saved card + Stripe PaymentIntent),
 * including duplicate / already_completed and 3DS (`requires_action`).
 * Mirrors legacy `processCreatePaymentSuccess` + `confirmCardAndFinish`.
 */
export async function handleStripePaymentCreateResult(
  paymentData: unknown,
  opts: {
    stripe: Stripe | null;
    selectedPaymentMethodId: string;
    completePayment: CompletePaymentFn;
    onSuccess: () => void;
    setProcessing: (v: boolean) => void;
  },
): Promise<void> {
  const { stripe, selectedPaymentMethodId, completePayment, onSuccess, setProcessing } =
    opts;
  const inner = unwrapApiSuccessData<Record<string, unknown>>(paymentData);
  const pd = { ...asRecord(paymentData), ...(inner ?? {}) };

  if (pd.already_completed) {
    setProcessing(false);
    onSuccess();
    showAppToast("Payment was already completed successfully.", "success");
    return;
  }

  const root = asRecord(pd.data);
  const nested = asRecord(root.data);

  const status = String(
    root.status ??
      nested.status ??
      pd.payment_intent_status ??
      asRecord(pd.payment_data).status ??
      "",
  );
  const requiresAction = Boolean(pd.requires_action);
  const clientSecret = String(
    root.client_secret ??
      nested.client_secret ??
      pd.client_secret ??
      asRecord(pd.payment_data).client_secret ??
      "",
  ).trim();

  const payObj = asRecord(root.payment);
  const nestedPay = asRecord(nested.payment);
  const paymentIdRaw =
    payObj.id ??
    nestedPay.id ??
    nested.payment_id ??
    pd.payment_id ??
    root.payment_id;
  const paymentId =
    typeof paymentIdRaw === "number"
      ? paymentIdRaw
      : Number.parseInt(String(paymentIdRaw ?? ""), 10);

  const paymentMethodId =
    selectedPaymentMethodId ||
    String(payObj.payment_method_id ?? payObj.payment_method ?? "");

  const duplicate = Boolean(pd.duplicate);

  async function finishSuccess(
    pid: number | undefined,
    message: string,
  ): Promise<void> {
    const validPid =
      pid != null && Number.isFinite(pid) && !Number.isNaN(pid) ? pid : undefined;
    if (validPid != null) {
      try {
        await completePayment({
          payment_id: validPid,
          payment_method: "stripe",
        });
      } catch {
        setProcessing(false);
        onSuccess();
        showAppToast(`${message} Status update may be delayed.`, "success");
        return;
      }
    }
    setProcessing(false);
    onSuccess();
    showAppToast(message, "success");
  }

  async function confirmCardAndFinish(secret: string): Promise<void> {
    if (!stripe) {
      setProcessing(false);
      showAppToast("Stripe is not available.", "error");
      return;
    }
    const confirmOptions = paymentMethodId
      ? { payment_method: paymentMethodId }
      : {};
    const { error: confirmError, paymentIntent } =
      await stripe.confirmCardPayment(secret, confirmOptions);
    if (confirmError) {
      setProcessing(false);
      showAppToast(
        confirmError.message ||
          "Authentication failed. Try again or use a different card.",
        "error",
      );
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      await finishSuccess(
        Number.isFinite(paymentId) ? paymentId : undefined,
        "Payment authenticated and processed successfully.",
      );
    } else if (paymentIntent?.status === "requires_action") {
      setProcessing(false);
      showAppToast(
        "Payment requires additional authentication. Please try again.",
        "error",
      );
    } else {
      setProcessing(false);
      onSuccess();
      showAppToast(
        "Payment is being processed. Status will be updated shortly.",
        "success",
      );
    }
  }

  if (duplicate) {
    if (status === "succeeded" || status === "processing") {
      await finishSuccess(
        Number.isFinite(paymentId) ? paymentId : undefined,
        "Payment processed successfully.",
      );
      return;
    }
    if (
      status === "requires_action" ||
      requiresAction ||
      (clientSecret && stripe)
    ) {
      if (!clientSecret || !stripe) {
        setProcessing(false);
        showAppToast(
          "Payment requires authentication but client secret is missing. Please try again.",
          "error",
        );
        return;
      }
      await confirmCardAndFinish(clientSecret);
      return;
    }
    setProcessing(false);
    onSuccess();
    showAppToast("Payment processed successfully.", "success");
    return;
  }

  if (status === "succeeded" || status === "processing") {
    await finishSuccess(
      Number.isFinite(paymentId) ? paymentId : undefined,
      "Payment processed successfully.",
    );
    return;
  }
  if (
    status === "requires_action" ||
    requiresAction ||
    (clientSecret && stripe)
  ) {
    if (!clientSecret || !stripe) {
      setProcessing(false);
      showAppToast(
        "Payment requires authentication but client secret is missing. Please try again.",
        "error",
      );
      return;
    }
    await confirmCardAndFinish(clientSecret);
    return;
  }
  setProcessing(false);
  onSuccess();
  showAppToast("Payment processed successfully.", "success");
}
