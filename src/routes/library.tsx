import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GuestOrApp } from "@/components/layout/guest-or-app";

export const Route = createFileRoute("/library")({ component: LibraryLayout });

function LibraryLayout() {
  return (
    <GuestOrApp>
      <Outlet />
    </GuestOrApp>
  );
}
