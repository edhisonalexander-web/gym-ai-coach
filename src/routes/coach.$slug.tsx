import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { CameraSession } from "@/components/coach/camera-session";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getExercise } from "@/lib/exercises/catalog";
import { getProfile } from "@/lib/server/profile";
import { getTodaySessionCount } from "@/lib/server/workouts";

export const Route = createFileRoute("/coach/$slug")({
  component: SessionPage,
  loader: ({ params }) => {
    const ex = getExercise(params.slug);
    if (!ex) throw notFound();
    return ex;
  },
});

function SessionPage() {
  const exercise = Route.useLoaderData();
  return <Session exerciseSlug={exercise.slug} />;
}

function Session({ exerciseSlug }: { exerciseSlug: string }) {
  const exercise = getExercise(exerciseSlug)!;
  const { user } = useCurrentUserState();
  const signedIn = Boolean(user);
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: signedIn,
  });
  const quota = useQuery({
    queryKey: ["quota"],
    queryFn: () => getTodaySessionCount(),
    enabled: signedIn,
  });
  const canStart =
    !signedIn || quota.isPending || Boolean(quota.data?.isPremium || (quota.data?.remaining ?? 0) > 0);

  return (
    <CameraSession
      exercise={exercise}
      weightKg={profile.data?.weightKg ?? null}
      voiceCues={profile.data?.voiceCues ?? true}
      canStart={canStart}
      signedIn={signedIn}
    />
  );
}
