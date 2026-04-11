"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Mount once under `AppProviders`. Required for `toast()` from `@/lib/toast/appToast`.
 */
export function AppToastContainer() {
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
      theme="dark"
      toastClassName="!rounded-xl !border !border-zinc-700/80 !bg-zinc-900 !text-sm !text-zinc-100 !shadow-lg"
    />
  );
}
