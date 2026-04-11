"use client";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppToastContainer } from "@/components/ui/AppToastContainer";
import { AuthProvider } from "@/contexts/auth-context";
import { DisplayCurrencyProvider } from "@/contexts/currency-display-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <QueryProvider>
        <AuthProvider>
          <DisplayCurrencyProvider>{children}</DisplayCurrencyProvider>
        </AuthProvider>
      </QueryProvider>
      <AppToastContainer />
    </div>
  );
}
