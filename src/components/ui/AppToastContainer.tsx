"use client";

import { useSyncExternalStore } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function subscribePreferredDark(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getPreferredDarkSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getPreferredDarkServerSnapshot() {
  return false;
}

/**
 * Mount once under `AppProviders`. Required for `toast()` from `@/lib/toast/appToast`.
 */
export function AppToastContainer() {
  const isDark = useSyncExternalStore(
    subscribePreferredDark,
    getPreferredDarkSnapshot,
    getPreferredDarkServerSnapshot,
  );

  return (
    <ToastContainer
      position="top-right"
      autoClose={6000}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      limit={5}
      theme={isDark ? "dark" : "light"}
      toastClassName={
        isDark
          ? "!rounded-xl !border !border-zinc-700/80 !bg-zinc-900/95 !text-sm !text-zinc-100 !shadow-xl !backdrop-blur-md"
          : "!rounded-xl !border !border-zinc-200/90 !bg-white/95 !text-sm !text-zinc-900 !shadow-lg !backdrop-blur-md"
      }
    />
  );
}
