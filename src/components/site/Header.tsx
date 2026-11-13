import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSelection } from "@/lib/selection";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { items, setOpen } = useSelection();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-navy/80 transition-colors hover:text-primary data-[status=active]:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-navy transition-colors hover:bg-secondary"
            aria-label={`Selected courses (${items.length})`}
          >
            <ShoppingCart className="h-5.5 w-5.5" />
            {items.length > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {items.length}
              </span>
            )}
          </button>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/register">Register Now</Link>
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-navy transition-colors hover:bg-secondary lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-[85%] max-w-sm">
          <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Logo />
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
            {[...NAV, { to: "/register", label: "Student Registration" } as const].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-xl px-4 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-secondary data-[status=active]:bg-sky data-[status=active]:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3 p-4">
            <Button asChild size="lg" className="w-full" onClick={() => setMenuOpen(false)}>
              <Link to="/register">Register Now</Link>
            </Button>
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy"
            >
              <ShieldCheck className="h-4 w-4" /> Admin login
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
