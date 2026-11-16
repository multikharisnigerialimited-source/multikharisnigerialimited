import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Home, Loader2, RotateCcw, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/money";
import { verifyPayment } from "@/lib/payment.functions";

export const Route = createFileRoute("/payment/callback")({
  validateSearch: z.object({ reference: z.string().max(60).optional(), trxref: z.string().max(60).optional() }),
  head: () => ({
    meta: [
      { title: "Payment Status — Multikharis Nigeria Limited" },
      { name: "description", content: "Confirmation of your Multikharis training fee payment." },
      { property: "og:title", content: "Payment Status — Multikharis" },
      { property: "og:description", content: "Confirmation of your training fee payment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallbackPage,
});

function CallbackPage() {
  const search = Route.useSearch();
  const txRef = search.reference ?? search.trxref ?? "";
  const verify = useServerFn(verifyPayment);
  const { data, error, isLoading } = useQuery({
    queryKey: ["verify-payment", txRef],
    queryFn: () => verify({ data: { txRef } }),
    enabled: !!txRef,
    retry: 1,
    staleTime: Infinity,
  });
  const regRef = data?.registrationReference || txRef.replace(/-P[A-Z0-9]+$/, "");

  return (
    <section className="bg-gradient-hero py-12 md:py-20">
      <div className="container-page max-w-lg">
        <div className="flex flex-col items-center rounded-[2rem] border border-border/60 bg-card p-8 text-center shadow-card">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h1 className="mt-6 text-xl font-extrabold text-navy">Confirming your payment…</h1>
            </>
          ) : data?.status === "success" ? (
            <>
              <span className="flex h-24 w-24 animate-pop items-center justify-center rounded-full bg-success text-success-foreground shadow-card">
                <Check className="h-12 w-12" strokeWidth={3} />
              </span>
              <h1 className="mt-6 text-2xl font-extrabold text-navy">PAYMENT SUCCESSFUL!</h1>
              <p className="mt-2 text-muted-foreground">
                We received <strong className="text-navy">{formatNaira(data.amount)}</strong> for registration{" "}
                <strong className="font-mono text-primary">{data.registrationReference}</strong>.
              </p>
            </>
          ) : (
            <>
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <X className="h-12 w-12" strokeWidth={3} />
              </span>
              <h1 className="mt-6 text-2xl font-extrabold text-navy">
                {data?.status === "pending" ? "Payment not completed yet" : "Payment was not successful"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : !txRef
                    ? "This payment link is missing its reference."
                    : "No money was taken for this attempt. You can try again."}
              </p>
              <Button asChild size="lg" className="mt-6">
                <Link to="/pay" search={{ ref: regRef || undefined }}>
                  <RotateCcw /> TRY AGAIN
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="subtle" size="lg" className="mt-4">
            <Link to="/"><Home /> BACK TO HOME</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
