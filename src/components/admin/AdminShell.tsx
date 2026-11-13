import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, ShieldAlert, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQuery } from "@/lib/admin-data";

export function AdminShell({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery(isAdminQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="no-print sticky top-0 z-30 bg-gradient-navy text-navy-foreground shadow-card">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Link to="/admin" className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block font-display text-sm font-extrabold">MULTIKHARIS</span>
              <span className="block text-[10px] font-semibold tracking-[0.2em] text-primary">ADMIN DASHBOARD</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-navy-foreground/70 md:block">{data?.email}</span>
            <Button asChild variant="ghost" size="sm" className="text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground">
              <Link to="/">
                <ExternalLink /> <span className="hidden sm:inline">Website</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground">
              <LogOut /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="py-32 text-center text-destructive">Could not verify your access. Please refresh.</p>
      ) : !data?.isAdmin ? (
        <div className="container-page flex max-w-md flex-col items-center py-24 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-navy">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The account <strong>{data?.email}</strong> is not an authorised administrator of Multikharis Nigeria Limited.
          </p>
          <Button className="mt-6" onClick={signOut}>
            Sign in with another account
          </Button>
        </div>
      ) : (
        <main className="container-page py-6 md:py-8">{children}</main>
      )}
    </div>
  );
}
