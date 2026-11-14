import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { REG_REF, TX_REF } from "./money";

const startSchema = z.object({
  reference: z.string().trim().toUpperCase().regex(REG_REF, "Enter your reference number, e.g. MNL-2026-000123"),
  email: z.string().trim().toLowerCase().email("Enter the email address you registered with").max(255),
});

function siteOrigin() {
  const origin = getRequestHeader("origin");
  try {
    if (origin) {
      const u = new URL(origin);
      if (u.protocol === "https:" || u.hostname === "localhost") return u.origin;
    }
  } catch {
    /* fall through */
  }
  return new URL(getRequest().url).origin;
}

export const startPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = startSchema.safeParse(input);
    if (!r.success) throw new Error(r.error.issues[0]?.message ?? "Check your details and try again.");
    return r.data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { paystack, feeForCourses, PaymentsNotConfigured } = await import("./paystack.server");

    const { data: reg, error } = await supabaseAdmin
      .from("registrations")
      .select("id, reference, email, courses, payment_status, first_name, surname")
      .eq("reference", data.reference)
      .eq("email", data.email)
      .maybeSingle();
    if (error) {
      console.error("registration lookup failed", error);
      throw new Error("We couldn't look up your registration. Please try again.");
    }
    if (!reg) throw new Error("We couldn't find a registration with that reference number and email.");
    if (reg.payment_status === "paid") return { alreadyPaid: true as const, authorizationUrl: null };

    const amount = await feeForCourses(supabaseAdmin, reg.courses);
    if (amount <= 0) {
      throw new Error("The fee for your selected courses hasn't been set yet. Our team will contact you about payment.");
    }
    await supabaseAdmin.from("registrations").update({ amount_due: amount }).eq("id", reg.id);

    const txRef = `${reg.reference}-${Date.now().toString(36).toUpperCase()}`;
    let init: { authorization_url: string; reference: string };
    try {
      init = await paystack<{ authorization_url: string; reference: string }>("/transaction/initialize", {
        method: "POST",
        body: {
          email: reg.email,
          amount,
          currency: "NGN",
          reference: txRef,
          channels: ["card"],
          callback_url: `${siteOrigin()}/payment/callback`,
          metadata: {
            registration_reference: reg.reference,
            custom_fields: [
              { display_name: "Registration", variable_name: "registration_reference", value: reg.reference },
              { display_name: "Applicant", variable_name: "applicant", value: `${reg.surname} ${reg.first_name}` },
            ],
          },
        },
      });
    } catch (e) {
      if (e instanceof PaymentsNotConfigured) throw e;
      throw new Error("We couldn't start the card payment. Please try again in a moment.");
    }

    const { error: insErr } = await supabaseAdmin
      .from("payments")
      .insert({ registration_id: reg.id, reference: txRef, amount, status: "pending" });
    if (insErr) {
      console.error("payment insert failed", insErr);
      throw new Error("We couldn't start the card payment. Please try again.");
    }
    return { alreadyPaid: false as const, authorizationUrl: init.authorization_url };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = z.object({ txRef: z.string().trim().regex(TX_REF) }).safeParse(input);
    if (!r.success) throw new Error("This payment link is not valid.");
    return r.data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyAndRecord } = await import("./paystack.server");
    try {
      const res = await verifyAndRecord(supabaseAdmin, data.txRef);
      if (!res) throw new Error("We couldn't find this payment.");
      return res;
    } catch (e) {
      console.error("payment verification failed", e);
      throw new Error("We couldn't confirm your payment yet. If you were charged, please contact us with your reference number.");
    }
  });
