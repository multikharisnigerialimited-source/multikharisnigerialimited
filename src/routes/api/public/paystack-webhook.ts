import { createFileRoute } from "@tanstack/react-router";
import { TX_REF } from "@/lib/money";

// Paystack calls this after a charge. The body is never trusted: the reference is
// re-verified directly with Paystack before anything is recorded.
export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let event: { event?: unknown; data?: { reference?: unknown } } = {};
        try {
          event = JSON.parse(await request.text());
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        const ref = event.data?.reference;
        if (event.event !== "charge.success" || typeof ref !== "string" || !TX_REF.test(ref)) {
          return new Response("ignored", { status: 200 });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { verifyAndRecord } = await import("@/lib/paystack.server");
          await verifyAndRecord(supabaseAdmin, ref);
        } catch (e) {
          console.error("paystack webhook processing failed", e);
          return new Response("retry", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
