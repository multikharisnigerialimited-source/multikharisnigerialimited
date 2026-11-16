import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Copy, CreditCard, ImageUp, Landmark, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { processImage } from "@/lib/image";
import { formatNaira } from "@/lib/money";
import { checkPaymentReceipt } from "@/lib/registration.functions";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Errors, FormState } from "./types";

export function PaymentChoice({
  form,
  setForm,
  errors,
  fee,
}: {
  form: FormState;
  setForm: (f: (prev: FormState) => FormState) => void;
  errors: Errors;
  fee: number;
}) {
  const check = useServerFn(checkPaymentReceipt);
  const inputRef = useRef<HTMLInputElement>(null);
  const { method, receipt } = form.payment;
  const p = SITE.payout;

  const setMethod = (m: "card" | "transfer") => setForm((f) => ({ ...f, payment: { ...f.payment, method: m } }));

  async function onFile(file?: File) {
    if (!file) return;
    let img;
    try {
      img = await processImage(file, 1600, 0.85);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That image could not be used.");
      return;
    }
    setForm((f) => ({ ...f, payment: { ...f.payment, receipt: { ...img, status: "checking", message: "" } } }));
    try {
      const res = await check({ data: { receipt: { data: img.data, type: img.type }, courses: form.training.courses } });
      setForm((f) =>
        f.payment.receipt?.data === img.data
          ? { ...f, payment: { ...f.payment, receipt: { ...img, status: res.ok ? "ok" : "rejected", message: res.message } } }
          : f,
      );
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : "We couldn't check your receipt. Please try again.";
      setForm((f) =>
        f.payment.receipt?.data === img.data ? { ...f, payment: { ...f.payment, receipt: { ...img, status: "rejected", message } } } : f,
      );
    }
  }

  return (
    <section className={cn("rounded-2xl border bg-background p-5", errors.payment && "border-destructive")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">Payment</h3>
        {fee > 0 && <span className="font-display text-xl font-extrabold text-primary">{formatNaira(fee)}</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
        <MethodCard
          active={method === "card"}
          onClick={() => setMethod("card")}
          icon={<CreditCard className="h-5 w-5" />}
          title="Pay with card"
          text="Mastercard, Visa or Verve — pay securely right after you submit."
        />
        <MethodCard
          active={method === "transfer"}
          onClick={() => setMethod("transfer")}
          icon={<Landmark className="h-5 w-5" />}
          title="Bank transfer"
          text="Transfer first, then upload a screenshot of your receipt."
        />
      </div>
      {errors.payment && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors.payment}</p>}

      {method === "card" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-sky p-3 text-sm text-navy">
          <MastercardMark />
          <span>After you submit, tap <strong>PAY WITH CARD</strong> to pay {fee > 0 ? formatNaira(fee) : "your fee"} with your Mastercard or any Nigerian debit card.</span>
        </div>
      )}

      {method === "transfer" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-sky p-4 text-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transfer {fee > 0 ? formatNaira(fee) : "your fee"} to</p>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Account name</dt><dd className="font-bold text-navy">{p.accountName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Bank</dt><dd className="font-bold text-navy">{p.bank}</dd></div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Account number</dt>
                <dd className="flex items-center gap-2 font-mono text-base font-bold text-navy">
                  {p.accountNumber}
                  <button
                    type="button"
                    aria-label="Copy account number"
                    onClick={() => {
                      navigator.clipboard?.writeText(p.accountNumber);
                      toast.success("Account number copied");
                    }}
                    className="text-primary hover:opacity-80"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </dd>
              </div>
            </dl>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Upload payment receipt"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {!receipt ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition hover:border-primary hover:bg-primary/5",
                errors.receipt ? "border-destructive" : "border-border",
              )}
            >
              <ImageUp className="h-8 w-8 text-primary" />
              <span className="font-semibold text-navy">Upload payment receipt screenshot</span>
              <span className="text-xs text-muted-foreground">Required before you can submit · JPG or PNG</span>
            </button>
          ) : (
            <div className="flex gap-4 rounded-2xl border p-3">
              <img src={receipt.preview} alt="Uploaded payment receipt" className="h-28 w-20 shrink-0 rounded-lg border object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                {receipt.status === "checking" && (
                  <p className="flex items-center gap-2 font-semibold text-navy"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Checking your receipt…</p>
                )}
                {receipt.status === "ok" && (
                  <p className="flex items-start gap-2 font-semibold text-success"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {receipt.message}</p>
                )}
                {receipt.status === "rejected" && (
                  <p role="alert" className="flex items-start gap-2 font-semibold text-destructive"><XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {receipt.message}</p>
                )}
                <Button type="button" variant="subtle" size="sm" className="mt-3" onClick={() => inputRef.current?.click()} disabled={receipt.status === "checking"}>
                  <RefreshCw /> Change screenshot
                </Button>
              </div>
            </div>
          )}
          {errors.receipt && !receipt && <p role="alert" className="text-xs font-medium text-destructive">{errors.receipt}</p>}
        </div>
      )}
    </section>
  );
}

function MethodCard({ active, onClick, icon, title, text }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; text: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition",
        active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/50",
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-sky text-navy")}>{icon}</span>
      <span>
        <span className="block font-bold text-navy">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>
      </span>
    </button>
  );
}

/** Two overlapping circles in Mastercard's style; uses theme tokens. */
function MastercardMark() {
  return (
    <span className="relative flex h-6 w-10 shrink-0" aria-label="Mastercard">
      <span className="absolute left-0 h-6 w-6 rounded-full bg-destructive" />
      <span className="absolute right-0 h-6 w-6 rounded-full bg-warning opacity-90" />
    </span>
  );
}
