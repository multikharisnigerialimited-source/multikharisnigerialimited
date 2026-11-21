import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ministerSchema } from "./minister-schema";
import { normalizePhone } from "./registration-schema";

export const submitMinisterRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ministerSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("minister_registrations")
      .insert({
        name: data.name,
        title: data.title,
        church: data.church,
        gender: data.gender,
        address: data.address,
        phone: normalizePhone(data.phone),
        whatsapp: data.whatsapp ? normalizePhone(data.whatsapp) : null,
      })
      .select("reference")
      .single();
    if (error || !row) {
      console.error("minister insert failed", error);
      throw new Error("We couldn't save your registration. Please try again.");
    }
    const { postLeadAlert } = await import("./slack.server");
    await postLeadAlert(`⛪ New Church Minister registration ${row.reference}`, [
      ["Name", `${data.title} ${data.name}`],
      ["Church/Denomination", data.church],
      ["Phone", normalizePhone(data.phone)],
      ["WhatsApp", data.whatsapp ? normalizePhone(data.whatsapp) : null],
    ]);
    return { reference: row.reference };
  });

/** Admin: set a minister's payment (kobo) and approval status. */
export const updateMinister = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        amount_due: z.number().int().min(0).max(100_000_000),
        amount_paid: z.number().int().min(0).max(100_000_000),
        status: z.enum(["pending", "approved", "rejected"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const paid = data.amount_paid > 0 && data.amount_paid >= data.amount_due;
    const { error } = await context.supabase
      .from("minister_registrations")
      .update({ amount_due: data.amount_due, amount_paid: data.amount_paid, status: data.status, payment_status: paid ? "paid" : "unpaid" })
      .eq("id", data.id);
    if (error) throw new Error("Could not save changes. Please try again.");
    return { ok: true };
  });
