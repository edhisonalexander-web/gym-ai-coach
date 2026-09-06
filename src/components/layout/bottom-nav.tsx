import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Camera, House, LineChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS: Array<{
  to: "/" | "/library" | "/coach" | "/stats" | "/profile";
  label: string;
  icon: typeof House;
  match: (p: string) => boolean;
  featured?: boolean;
}> = [
  { to: "/", label: "Inicio", icon: House, match: (p) => p === "/" },
  { to: "/library", label: "Biblioteca", icon: BookOpen, match: (p) => p.startsWith("/library") },
  { to: "/coach", label: "Coach", icon: Camera, match: (p) => p.startsWith("/coach"), featured: true },
  { to: "/stats", label: "Progreso", icon: LineChart, match: (p) => p.startsWith("/stats") || p.startsWith("/history") },
  { to: "/profile", label: "Perfil", icon: User, match: (p) => p.startsWith("/profile") || p.startsWith("/premium") || p.startsWith("/plan") },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/coach/") && pathname !== "/coach") return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Principal"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-2 pt-1">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex justify-center">
              <Link
                to={item.to}
                className={cn(
                  "flex min-h-12 w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full transition-[background-color,color] duration-150",
                    item.featured && "bg-primary text-primary-foreground",
                    item.featured && !active && "opacity-90",
                    !item.featured && active && "bg-primary/10",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
