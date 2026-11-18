import { Link } from "@tanstack/react-router";
import { Check, Copy, Home, Info, Mail, MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PayCard } from "@/components/payment/PayCard";

export function StepSuccess({
  reference,
  email,
  amountDue,
  method,
}: {
  reference: string;
  email: string;
  amountDue: number;
  method: "card" | "transfer";
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-full bg-success/25" />
        <span className="relative flex h-28 w-28 animate-pop items-center justify-center rounded-full bg-success text-success-foreground shadow-card">
          <Check className="h-14 w-14" strokeWidth={3} />
        </span>
      </div>
      <h2 className="mt-8 text-2xl font-extrabold text-navy sm:text-3xl">REGISTRATION SUCCESSFUL!</h2>
      <p className="mt-3 max-w-md text-muted-foreground">
        Your registration has been successfully submitted and saved.
      </p>
      <div className="mt-8 w-full max-w-sm rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Registration Reference</p>
        <p className="mt-2 whitespace-nowrap font-display text-2xl font-extrabold text-primary sm:text-3xl" data-testid="reference">
          {reference}
        </p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(reference);
            toast.success("Reference number copied");
          }}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-navy/70 hover:text-primary"
        >
          <Copy className="h-3.5 w-3.5" /> Copy reference
        </button>
      </div>
      <div className="mt-6 w-full max-w-sm rounded-3xl border border-warning/50 bg-warning/15 p-5 text-left" role="note">
        <p className="flex items-center gap-2 text-sm font-bold text-navy">
          <Info className="h-4 w-4 shrink-0 text-primary" /> No confirmation email will be sent
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Confirmation emails are not available yet. Please save your reference number and contact us with it to confirm
          your registration.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button asChild variant="success" size="sm" className="col-span-2">
            <a
              href={`${SITE.whatsapp}?text=${encodeURIComponent(`Hello Multikharis, I just registered. My reference number is ${reference}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle /> Send reference on WhatsApp
            </a>
          </Button>
          <Button asChild variant="subtle" size="sm">
            <a href={SITE.phoneHrefs[0]}>
              <Phone /> Call
            </a>
          </Button>
          <Button asChild variant="subtle" size="sm">
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Registration ${reference}`)}&body=${encodeURIComponent(`Hello, my registration reference number is ${reference}.`)}`}
            >
              <Mail /> Email
            </a>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {SITE.phones.join(" · ")} · {SITE.email}
        </p>
      </div>
      {method === "transfer" ? (
        <div className="mt-8 w-full max-w-sm rounded-3xl bg-success/10 p-5 text-left">
          <p className="text-sm font-bold text-success">Payment receipt received</p>
          <p className="mt-1 text-sm text-muted-foreground">Our team will confirm your bank transfer and update your registration.</p>
        </div>
      ) : (
        <PayCard reference={reference} email={email} amountDue={amountDue} className="mt-8" />
      )}
      <Button asChild size="xl" variant={method === "card" && amountDue > 0 ? "subtle" : "default"} className="mt-6">
        <Link to="/">
          <Home /> BACK TO HOME
        </Link>
      </Button>
    </div>
  );
}
