import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Landmark, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startPayment } from "@/lib/payment.functions";
import { formatNaira } from "@/lib/money";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function PayoutNote({ className }: { className?: string | undefined }) {
  const p = SITE.payout;
  return (
    <p className={cn("flex items-start gap-2 text-left text-xs text-muted-foreground", className)}>
      <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>
        All payments go to <strong className="text-navy">{p.accountName}</strong> · {p.bank} ·{" "}
        <strong className="font-mono text-navy">{p.accountNumber}</strong>
      </span>
    </p>
  );
}

/** Starts a secure Paystack card checkout for a saved registration. */
export function usePay() {
  const start = useServerFn(startPayment);
  const [loading, setLoading] = useState(false);
  async function pay(reference: string, email: string) {
    setLoading(true);
    try {
      const res = await start({ data: { reference, email } });
      if (res.alreadyPaid) {
        toast.success("This registration has already been paid for.");
        setLoading(false);
        return;
      }
      window.location.assign(res.authorizationUrl);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "We couldn't start the card payment.");
      setLoading(false);
    }
  }
  return { pay, loading };
}

export function PayCard({
  reference,
  email,
  amountDue,
  className,
}: {
  reference: string;
  email: string;
  amountDue: number;
  className?: string;
}) {
  const { pay, loading } = usePay();
  if (amountDue <= 0) {
    return (
      <div className={cn("w-full max-w-sm rounded-3xl bg-sky p-5 text-left", className)}>
        <p className="text-sm font-semibold text-navy">Training fee</p>
        <p className="mt-1 text-sm text-muted-foreground">Our admissions team will contact you with your training fee.</p>
        <PayoutNote className="mt-3" />
      </div>
    );
  }
  return (
    <div className={cn("w-full max-w-sm rounded-3xl border border-border/70 bg-card p-5 text-left shadow-soft", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-navy">Training fee</span>
        <span className="font-display text-2xl font-extrabold text-navy">{formatNaira(amountDue)}</span>
      </div>
      <Button size="lg" className="mt-4 w-full" onClick={() => pay(reference, email)} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
        {loading ? "OPENING SECURE PAYMENT…" : "PAY WITH CARD"}
      </Button>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-success" /> Secure card payment by Paystack · Visa, Mastercard, Verve
      </p>
      <PayoutNote className="mt-2" />
    </div>
  );
}
