'use client';

import { DiagnosticProvider } from "@/context/DiagnosticContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DiagnosticProvider>
      {children}
    </DiagnosticProvider>
  );
}
