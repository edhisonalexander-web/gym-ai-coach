import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-primary", className)} aria-hidden>
      <rect x="3" y="13" width="26" height="6" rx="2" fill="currentColor" />
      <rect x="2" y="9" width="6" height="14" rx="2" fill="currentColor" />
      <rect x="24" y="9" width="6" height="14" rx="2" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className="size-7" />
      <span className="font-display text-base font-semibold tracking-tight">
        Gym AI <span className="text-primary">Coach</span>
      </span>
    </div>
  );
}
