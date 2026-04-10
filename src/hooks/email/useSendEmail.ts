"use client";

import { useMutation } from "@tanstack/react-query";
import { sendEmail } from "@/services/email.service";

export function useSendEmail() {
  return useMutation({
    mutationFn: sendEmail,
  });
}
