import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import { SITE } from "@/lib/site";

const quick = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About Us" },
  { to: "/register", label: "Student Registration" },
  { to: "/pay", label: "Make Payment" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function Footer() {
  return (
    <footer className="no-print bg-gradient-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Logo inverted />
          <p className="font-display text-sm font-bold tracking-[0.25em] text-primary">{SITE.tagline}</p>
          <p className="text-sm leading-relaxed text-navy-foreground/70">
            Empowering NYSC Corps Members and Students with in-demand digital skills for a better future.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-base font-bold">Quick Links</h3>
          <ul className="space-y-2.5">
            {quick.map((q) => (
              <li key={q.to}>
                <Link to={q.to} className="text-sm text-navy-foreground/70 transition-colors hover:text-primary">
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-base font-bold">Contact</h3>
          <ul className="space-y-3 text-sm text-navy-foreground/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {SITE.address}
            </li>
            {SITE.phones.map((p, i) => (
              <li key={p}>
                <a href={SITE.phoneHrefs[i]} className="flex gap-3 hover:text-primary">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {p}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${SITE.email}`} className="flex gap-3 break-all hover:text-primary">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-base font-bold">Follow Us</h3>
          <SocialIcons />
          <Link
            to="/admin"
            className="mt-6 inline-block text-xs text-navy-foreground/50 transition-colors hover:text-navy-foreground"
          >
            Administrator login
          </Link>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-navy-foreground/60 sm:flex-row">
          <p>© 2026 Multikharis Nigeria Limited. All Rights Reserved.</p>
          <Link to="/terms" className="hover:text-primary">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
