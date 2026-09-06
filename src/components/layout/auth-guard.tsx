import { useQuery } from "@tanstack/react-query";
import { Navigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getProfile } from "@/lib/server/profile";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: Boolean(user),
    staleTime: 15_000,
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col gap-4 px-5 pt-16">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  if (profileQuery.isPending) {
    return (
      <div className="flex min-h-dvh flex-col gap-4 px-5 pt-16">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const onboarded = profileQuery.data?.onboardingComplete;
  if (!onboarded && pathname !== "/onboarding") {
    return <Navigate to="/onboarding" />;
  }
  if (onboarded && pathname === "/onboarding") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
