import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently deletes a candidate, their passport photo, receipt and payment records. Admins only. */
export const deleteRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) throw new Error("Only administrators can delete candidates.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reg, error } = await supabaseAdmin
      .from("registrations")
      .select("id, photo_path, receipt_path")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error("Could not find this candidate.");
    if (!reg) return { deleted: false };

    const { error: delErr } = await supabaseAdmin.from("registrations").delete().eq("id", reg.id);
    if (delErr) {
      console.error("delete registration failed", delErr);
      throw new Error("Could not delete this candidate. Please try again.");
    }
    await supabaseAdmin.storage.from("passports").remove([reg.photo_path]);
    if (reg.receipt_path) await supabaseAdmin.storage.from("receipts").remove([reg.receipt_path]);
    return { deleted: true };
  });
