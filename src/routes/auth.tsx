import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LockKeyhole, MailCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Administrator Login — Multikharis Nigeria Limited" },
      { name: "description", content: "Secure sign-in for Multikharis Nigeria Limited administrators." },
      { property: "og:title", content: "Administrator Login — Multikharis" },
      { property: "og:description", content: "Secure administrator access." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(r?: string) {
  if (!r) return "/admin";
  try {
    const u = new URL(r, window.location.origin);
    if (u.origin !== window.location.origin) return "/admin";
    return u.pathname + u.search;
  } catch {
    return "/admin";
  }
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "setup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 8) {
      toast.error("Enter your email and a password of at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate({ href: safeRedirect(redirect), replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin", replace: true });
        else setSent(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-navy px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-foreground/70 hover:text-navy-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>
        <div className="rounded-[2rem] bg-card p-7 shadow-card sm:p-9">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="h-14 w-14" />
            <h1 className="mt-4 text-2xl font-extrabold text-navy">
              {mode === "signin" ? "Administrator Login" : "Set up admin account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Multikharis Nigeria Limited</p>
          </div>

          {sent ? (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-sky p-6 text-center">
              <MailCheck className="h-10 w-10 text-primary" />
              <p className="font-semibold text-navy">Check your email</p>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Open it, then sign in here.
              </p>
              <Button variant="subtle" onClick={() => { setSent(false); setMode("signin"); }}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1.5 block font-semibold text-navy">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="password" className="mb-1.5 block font-semibold text-navy">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl"
                />
                {mode === "setup" && <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters.</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <LockKeyhole />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {mode === "signin" ? (
                  <>
                    First time?{" "}
                    <button type="button" className="font-semibold text-primary" onClick={() => setMode("setup")}>
                      Set up your admin account
                    </button>
                  </>
                ) : (
                  <>
                    Only approved administrator emails get dashboard access.{" "}
                    <button type="button" className="font-semibold text-primary" onClick={() => setMode("signin")}>
                      Back to sign in
                    </button>
                  </>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
