import { createServerFn } from "@tanstack/react-start";
import { normalizePhone, submissionSchema } from "./registration-schema";

const MAX_PHOTO_BYTES = 2.5 * 1024 * 1024;

function decodeBase64(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function sniffImageType(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return "image/webp";
  return null;
}

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const parsed = submissionSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new Error(first?.message ?? "Some required information is missing.");
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    if (data.website) throw new Error("Submission rejected.");

    let bytes: Uint8Array;
    try {
      bytes = decodeBase64(data.photo.data);
    } catch {
      throw new Error("Your passport photograph could not be read. Please upload it again.");
    }
    if (bytes.byteLength > MAX_PHOTO_BYTES) throw new Error("Passport photograph must be smaller than 2.5MB.");
    const sniffed = sniffImageType(bytes);
    if (!sniffed) throw new Error("Passport photograph must be a JPG, PNG or WEBP image.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ext = sniffed === "image/png" ? "png" : sniffed === "image/webp" ? "webp" : "jpg";
    const photoPath = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
    const upload = await supabaseAdmin.storage
      .from("passports")
      .upload(photoPath, bytes, { contentType: sniffed, upsert: false });
    if (upload.error) {
      console.error("passport upload failed", upload.error);
      throw new Error("We couldn't upload your passport photograph. Please try again.");
    }

    const { personal: p, category: c, training: t } = data;
    const { feeForCourses } = await import("./paystack.server");
    let amountDue = 0;
    try {
      amountDue = await feeForCourses(supabaseAdmin, t.courses);
    } catch (e) {
      console.error("fee lookup failed", e);
    }
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        photo_path: photoPath,
        surname: p.surname,
        first_name: p.first_name,
        other_names: p.other_names || null,
        gender: p.gender,
        date_of_birth: p.date_of_birth,
        phone: normalizePhone(p.phone),
        whatsapp: p.whatsapp ? normalizePhone(p.whatsapp) : null,
        email: p.email.toLowerCase(),
        address: p.address,
        category: c.category,
        institution: c.institution,
        discipline: c.discipline,
        state_code: c.category === "nysc" ? c.state_code.toUpperCase() : null,
        callup_number: c.category === "nysc" ? c.callup_number : null,
        ppa: c.category === "nysc" ? c.ppa : null,
        level_of_study: c.category === "student" ? c.level_of_study : null,
        matric_number: c.category === "student" ? c.matric_number : null,
        courses: t.courses,
        training_mode: t.training_mode,
        training_schedule: t.training_schedule,
        training_location: t.training_mode === "Physical" ? t.training_location || null : null,
        agreed_terms: true,
        amount_due: amountDue,
      })
      .select("id, reference")
      .single();

    if (error || !row) {
      console.error("registration insert failed", error);
      await supabaseAdmin.storage.from("passports").remove([photoPath]);
      throw new Error("We couldn't save your registration. Please try again.");
    }

    // Confirmation + admin notification emails are sent here once an email domain is configured.

    return { reference: row.reference, amountDue };
  });
