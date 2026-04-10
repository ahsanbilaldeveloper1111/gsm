"use client";

import { useCallback, useState } from "react";
import { loginFormDefaults } from "@/lib/forms";
import type { LoginPayload } from "@/services/auth.service";

export function useLoginFormState(initial?: Partial<LoginPayload>) {
  const [values, setValues] = useState<LoginPayload>(() => ({
    ...loginFormDefaults(),
    ...initial,
  }));

  const reset = useCallback(() => {
    setValues(loginFormDefaults());
  }, []);

  return { values, setValues, reset };
}
