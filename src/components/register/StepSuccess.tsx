import { Link } from "@tanstack/react-router";
import { Check, Copy, Home } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PayCard } from "@/components/payment/PayCard";

export function StepSuccess({ reference, email, amountDue }: { reference: string; email: string; amountDue: number }) {
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
        Your registration has been successfully submitted. You will receive a confirmation email shortly.
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
      <p className="mt-4 max-w-sm text-xs text-muted-foreground">
        Please save this number. Confirmation will be sent to <strong className="text-navy">{email}</strong>.
      </p>
      <PayCard reference={reference} email={email} amountDue={amountDue} className="mt-8" />
      <Button asChild size="xl" variant={amountDue > 0 ? "subtle" : "default"} className="mt-6">
        <Link to="/">
          <Home /> BACK TO HOME
        </Link>
      </Button>
    </div>
  );
}
