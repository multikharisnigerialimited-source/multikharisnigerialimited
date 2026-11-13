import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-10 w-10", className)} aria-hidden="true">
      <rect width="48" height="48" rx="12" className="fill-navy" />
      <path
        d="M11 34V15.5c0-.9 1.1-1.3 1.7-.6L24 27.5l11.3-12.6c.6-.7 1.7-.3 1.7.6V34"
        fill="none"
        className="stroke-primary"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="10.5" r="3" className="fill-navy-foreground" />
    </svg>
  );
}

export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="Multikharis Nigeria Limited — home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[15px] font-extrabold tracking-tight sm:text-base",
            inverted ? "text-navy-foreground" : "text-navy",
          )}
        >
          MULTIKHARIS
        </span>
        <span
          className={cn(
            "mt-1 text-[9px] font-semibold tracking-[0.22em] sm:text-[10px]",
            inverted ? "text-navy-foreground/70" : "text-primary",
          )}
        >
          NIGERIA LIMITED
        </span>
      </span>
    </Link>
  );
}
