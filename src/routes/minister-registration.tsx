import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Church, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, TextField } from "@/components/register/Field";
import { MINISTER_TITLES, ministerSchema } from "@/lib/minister-schema";
import { submitMinisterRegistration } from "@/lib/minister.functions";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/minister-registration")({
  head: () => ({
    meta: [
      { title: "Church Minister Registration — Multikharis Nigeria Limited" },
      { name: "description", content: "Register for digital skills training as a Church Minister with Multikharis Nigeria Limited, Warri." },
      { property: "og:title", content: "Church Minister Registration — Multikharis" },
      { property: "og:description", content: "Pastors, ministers and church leaders: register for practical digital skills training." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinisterRegistration,
});

type Form = { name: string; title: string; church: string; gender: string; address: string; phone: string; whatsapp: string; website: string };
const empty: Form = { name: "", title: "", church: "", gender: "", address: "", phone: "", whatsapp: "", website: "" };

function MinisterRegistration() {
  const submit = useServerFn(submitMinisterRegistration);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState("");
  const [reference, setReference] = useState("");
  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailure("");
    const parsed = ministerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await submit({ data: parsed.data });
      setReference(res.reference);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "We couldn't save your registration. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (reference) {
    return (
      <section className="container mx-auto max-w-xl px-4 py-12 text-center">
        <CheckCircle2 className="mx-auto h-20 w-20 text-success" />
        <h1 className="mt-4 text-2xl font-extrabold text-navy">REGISTRATION SUCCESSFUL!</h1>
        <p className="mt-2 text-muted-foreground">Thank you. Our team will contact you about payment and your training schedule.</p>
        <div className="mt-6 rounded-2xl bg-sky p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your registration number</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-primary">{reference}</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Keep this number. Quote it when you call or WhatsApp us on {SITE.phones?.[0] ?? "08106168576"}.</p>
        <Button asChild size="lg" className="mt-6 rounded-full">
          <Link to="/">BACK TO HOME</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <Church className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-navy sm:text-3xl">Church Minister Registration</h1>
        <p className="mt-2 text-sm text-muted-foreground">Fill in your details. Our team will contact you about payment.</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4 rounded-3xl bg-card p-5 shadow-soft sm:grid-cols-2 sm:p-8">
        <TextField id="name" label="Full Name" required value={form.name} onChange={(v) => set("name", v)} error={errors.name} className="sm:col-span-2" />
        <Field id="title" label="Title" required error={errors.title}>
          <Select value={form.title} onValueChange={(v) => set("title", v)}>
            <SelectTrigger id="title" className={cn("h-12 w-full rounded-xl", errors.title && "border-destructive")}>
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              {MINISTER_TITLES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="gender" label="Gender" required error={errors.gender}>
          <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
            <SelectTrigger id="gender" className={cn("h-12 w-full rounded-xl", errors.gender && "border-destructive")}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <TextField id="church" label="Church/Denomination" required value={form.church} onChange={(v) => set("church", v)} error={errors.church} className="sm:col-span-2" />
        <TextField id="address" label="Address" required value={form.address} onChange={(v) => set("address", v)} error={errors.address} className="sm:col-span-2" />
        <TextField id="phone" label="Phone Number" required value={form.phone} onChange={(v) => set("phone", v)} error={errors.phone} placeholder="08012345678" />
        <TextField id="whatsapp" label="WhatsApp Number" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} error={errors.whatsapp} placeholder="08012345678" />
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" value={form.website} onChange={(e) => set("website", e.target.value)} aria-hidden="true" />
        {failure && <p role="alert" className="text-sm font-medium text-destructive sm:col-span-2">{failure}</p>}
        <Button type="submit" size="lg" disabled={loading} className="rounded-full sm:col-span-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} SUBMIT REGISTRATION
        </Button>
      </form>
    </section>
  );
}
