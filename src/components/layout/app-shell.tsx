import type { ReactNode } from "react";
import { AuthGuard } from "./auth-guard";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <AuthGuard>
      <div className="min-h-dvh bg-background">
        {children}
        {nav && <BottomNav />}
      </div>
    </AuthGuard>
  );
}
