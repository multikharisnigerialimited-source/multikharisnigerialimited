import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Info, Phone } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Phone },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Bottom navigation"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-card backdrop-blur-lg md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <span className="flex h-8 w-12 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-primary/10">
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
