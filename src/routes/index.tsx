import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/home/dashboard";
import { Landing } from "@/components/home/landing";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AuthGuard } from "@/components/layout/auth-guard";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <main className="flex min-h-dvh flex-col gap-4 px-5 pt-16">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </main>
    );
  }

  if (!user) return <Landing />;

  return (
    <AuthGuard>
      <Dashboard />
      <BottomNav />
    </AuthGuard>
  );
}
