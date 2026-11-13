import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MapPin, Phone, MessageCircle, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/site";
import { contactSchema, sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Multikharis Nigeria Limited" },
      {
        name: "description",
        content: "Visit us at Shop D7, College of Education, Warri, Delta State, or call 08106168576.",
      },
      { property: "og:title", content: "Contact Multikharis Nigeria Limited" },
      { property: "og:description", content: "Call, WhatsApp, email or visit our Warri training centre." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const send = useServerFn(sendContactMessage);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "phone" | "message", string>>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      setErrors(errs as typeof errors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await send({ data: parsed.data });
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "", website: "" });
    } catch {
      toast.error("We couldn't send your message. Please try again or call us.");
    } finally {
      setLoading(false);
    }
  }

  const actions = [
    { href: SITE.whatsapp, label: "WhatsApp Us", icon: MessageCircle, variant: "success" as const, external: true },
    { href: SITE.phoneHrefs[0], label: "Call Us", icon: Phone, variant: "default" as const },
    { href: `mailto:${SITE.email}`, label: "Email Us", icon: Mail, variant: "navy" as const },
  ];

  return (
    <>
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container-page text-center">
          <p className="eyebrow">Contact Us</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-5xl">MULTIKHARIS NIGERIA LIMITED</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Have questions about our training? Reach out — we're happy to help.
          </p>
          <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-2.5 sm:gap-3">
            {actions.map(({ href, label, icon: Icon, variant, external }) => (
              <Button key={label} asChild variant={variant} size="lg" className="px-2 sm:px-6">
                <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <Icon /> <span className="text-xs sm:text-sm">{label}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <InfoCard icon={MapPin} title="Address">
              {SITE.address}
            </InfoCard>
            <InfoCard icon={Phone} title="Phone">
              {SITE.phones.map((p, i) => (
                <a key={p} href={SITE.phoneHrefs[i]} className="block hover:text-primary">
                  {p}
                </a>
              ))}
            </InfoCard>
            <InfoCard icon={Mail} title="Email">
              <a href={`mailto:${SITE.email}`} className="break-all hover:text-primary">
                {SITE.email}
              </a>
            </InfoCard>
          </div>

          <form onSubmit={onSubmit} noValidate className="rounded-3xl border bg-card p-6 shadow-card sm:p-8 lg:col-span-3">
            <h2 className="text-2xl font-extrabold text-navy">Send us a message</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name" error={errors.name}>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 rounded-xl" />
              </Field>
              <Field id="email" label="Email address" error={errors.email}>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl" />
              </Field>
              <Field id="phone" label="Phone (optional)" error={errors.phone} className="sm:col-span-2">
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12 rounded-xl" />
              </Field>
              <Field id="message" label="Message" error={errors.message} className="sm:col-span-2">
                <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-xl" />
              </Field>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Send />} Send Message
            </Button>
          </form>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="container-page">
          <div className="overflow-hidden rounded-3xl border shadow-card">
            <iframe
              title="Multikharis Nigeria Limited location map"
              src={SITE.mapEmbed}
              className="h-80 w-full md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a href={SITE.mapLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            <MapPin className="h-4 w-4" /> Open in Google Maps
          </a>
        </div>
      </section>
    </>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof Mail; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-3xl bg-sky p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-primary shadow-soft">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="font-bold text-navy">{title}</h3>
        <div className="mt-1 text-sm text-navy/80">{children}</div>
      </div>
    </div>
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string | undefined; className?: string | undefined; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
