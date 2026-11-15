import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PayoutNote, usePay } from "@/components/payment/PayCard";

export const Route = createFileRoute("/pay")({
  validateSearch: z.object({ ref: z.string().max(30).optional() }),
  head: () => ({
    meta: [
      { title: "Pay Training Fee — Multikharis Nigeria Limited" },
      { name: "description", content: "Pay your Multikharis digital skills training fee securely by card." },
      { property: "og:title", content: "Pay Your Training Fee — Multikharis" },
      { property: "og:description", content: "Secure card payment for registered Multikharis applicants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PayPage,
});

function PayPage() {
  const { ref } = Route.useSearch();
  const [reference, setReference] = useState(ref ?? "");
  const [email, setEmail] = useState("");
  const { pay, loading } = usePay();

  return (
    <section className="bg-gradient-hero py-10 md:py-16">
      <div className="container-page max-w-lg">
        <div className="mb-6 text-center">
          <p className="eyebrow">Make Payment</p>
          <h1 className="mt-2 text-2xl font-extrabold text-navy sm:text-4xl">Pay your training fee</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter the reference number you got after registering.</p>
        </div>
        <form
          className="space-y-5 rounded-[2rem] border border-border/60 bg-card p-6 shadow-card sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            pay(reference, email);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="ref">Registration reference</Label>
            <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="MNL-2026-000123" required className="h-12 rounded-xl font-mono uppercase" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email used to register</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12 rounded-xl" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
            {loading ? "OPENING SECURE PAYMENT…" : "CONTINUE TO CARD PAYMENT"}
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" /> Secure card payment by Paystack · Visa, Mastercard, Verve
          </p>
          <PayoutNote />
        </form>
      </div>
    </section>
  );
}
