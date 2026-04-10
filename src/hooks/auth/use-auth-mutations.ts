"use client";

import { useMutation } from "@tanstack/react-query";
import {
  google2faDisable,
  google2faEnable,
  google2faGenerateNewSecret,
  google2faVerify,
} from "@/services/auth.service";

export function useGoogle2faVerify() {
  return useMutation({ mutationFn: google2faVerify });
}

export function useGoogle2faEnable() {
  return useMutation({ mutationFn: google2faEnable });
}

export function useGoogle2faDisable() {
  return useMutation({ mutationFn: google2faDisable });
}

export function useGoogle2faGenerateNewSecret() {
  return useMutation({ mutationFn: google2faGenerateNewSecret });
}
