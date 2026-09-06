import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AuthGuard } from "./auth-guard";
import { BottomNav } from "./bottom-nav";

export function GuestOrApp({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col gap-4 px-5 pt-16">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (user) {
    return (
      <AuthGuard>
        <div className="min-h-dvh bg-background">
          {children}
          <BottomNav />
        </div>
      </AuthGuard>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link to="/">
          <Wordmark />
        </Link>
        <Button asChild size="sm" variant="secondary">
          <Link to="/login">Entrar</Link>
        </Button>
      </header>
      {children}
    </div>
  );
}
