import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Message is too short").max(2000, "Message must be under 2000 characters"),
  website: z.string().max(0).optional(),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
    });
    if (error) {
      console.error("contact insert failed", error);
      throw new Error("We couldn't send your message. Please try again.");
    }
    const { postLeadAlert } = await import("./slack.server");
    await postLeadAlert(
      "✉️ New contact message",
      [
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone || null],
      ],
      data.message,
    );
    return { ok: true };
  });
