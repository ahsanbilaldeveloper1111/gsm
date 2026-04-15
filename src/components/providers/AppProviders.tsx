"use client";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppToastContainer } from "@/components/ui/AppToastContainer";
import { AuthProvider } from "@/contexts/auth-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
      <AppToastContainer />
    </div>
  );
}
