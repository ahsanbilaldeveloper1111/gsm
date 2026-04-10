"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { LoginPayload } from "@/services/auth.service";
import { useAuth } from "@/contexts/auth-context";

export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuth();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}
