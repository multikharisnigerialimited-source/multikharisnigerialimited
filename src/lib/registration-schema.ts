import { z } from "zod";

export const SKILLS = [
  "Computer Appreciation (Microsoft Office)",
  "Data Analysis",
  "Web Design",
  "AI Automation",
  "Social Media Marketing",
  "Product (UI/UX) Design",
  "Graphic Design",
  "Digital Marketing",
] as const;
export type Skill = (typeof SKILLS)[number];

export const LEVELS = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "600 Level",
  "ND 1",
  "ND 2",
  "HND 1",
  "HND 2",
  "Postgraduate",
] as const;

const NG_PHONE = /^(\+?234|0)[789][01]\d{8}$/;
const cleanPhone = (s: string) => s.replace(/[\s()-]/g, "");

const req = (label: string, max = 120) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or less`);

const phone = (label: string) =>
  req(label, 20).refine((v) => NG_PHONE.test(cleanPhone(v)), {
    message: "Enter a valid Nigerian phone number, e.g. 08012345678",
  });

export const personalSchema = z.object({
  surname: req("Surname", 60),
  first_name: req("First name", 60),
  other_names: z.string().trim().max(80).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Select your gender" }) }),
  date_of_birth: req("Date of birth", 10).refine(
    (v) => {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return false;
      const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= 12 && age <= 80;
    },
    { message: "Enter a valid date of birth" },
  ),
  phone: phone("Phone number"),
  whatsapp: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || NG_PHONE.test(cleanPhone(v)), {
      message: "Enter a valid WhatsApp number",
    })
    .optional(),
  email: req("Email address", 255).email("Enter a valid email address"),
  address: req("Home address", 300).refine((v) => v.length >= 5, "Enter your full home address"),
});

const nyscSchema = z.object({
  category: z.literal("nysc"),
  institution: req("Institution attended", 150),
  discipline: req("Course/Discipline", 120),
  state_code: req("State code", 20).refine((v) => /^[A-Z]{2}\/\d{2}[A-C]\/\d{3,5}$/i.test(v), {
    message: "Use the format DT/24A/1234",
  }),
  callup_number: req("Call-up number", 40),
  ppa: req("Place of Primary Assignment", 150),
});

const studentSchema = z.object({
  category: z.literal("student"),
  institution: req("Institution name", 150),
  discipline: req("Course/Discipline", 120),
  level_of_study: req("Level of study", 30),
  matric_number: req("Matriculation number", 40),
});

export const categorySchema = z.discriminatedUnion("category", [nyscSchema, studentSchema], {
  errorMap: () => ({ message: "Select whether you are an NYSC Corps Member or a Student" }),
});

export const trainingSchema = z
  .object({
    courses: z
      .array(z.enum(SKILLS))
      .min(1, "Select at least one skill you want to learn")
      .max(SKILLS.length),
    training_mode: z.enum(["Online", "Physical"], {
      errorMap: () => ({ message: "Select a training mode" }),
    }),
    training_schedule: z.enum(["Flexible", "Fixed"], {
      errorMap: () => ({ message: "Select a training schedule" }),
    }),
    training_location: z.string().trim().max(150).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.training_mode === "Physical" && !v.training_location?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["training_location"],
        message: "Enter your preferred training location",
      });
    }
  });

export const photoSchema = z.object({
  data: z.string().min(100, "Upload your passport photograph").max(4_000_000, "Photo is too large"),
  type: z.enum(["image/jpeg", "image/png", "image/webp"], {
    errorMap: () => ({ message: "Photo must be a JPG, PNG or WEBP image" }),
  }),
});

export const receiptSchema = z.object({
  data: z.string().min(100, "Upload a screenshot of your payment receipt").max(6_000_000, "Receipt image is too large"),
  type: z.enum(["image/jpeg", "image/png", "image/webp"], {
    errorMap: () => ({ message: "Receipt must be a JPG, PNG or WEBP image" }),
  }),
});

export const paymentSchema = z.discriminatedUnion(
  "method",
  [
    z.object({ method: z.literal("card") }),
    z.object({ method: z.literal("transfer"), receipt: receiptSchema }),
  ],
  { errorMap: () => ({ message: "Choose how you will pay: card or bank transfer with receipt" }) },
);

export const submissionSchema = z
  .object({
    personal: personalSchema,
    category: categorySchema,
    training: trainingSchema,
    photo: photoSchema,
    payment: paymentSchema,
    agreed_terms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    website: z.string().max(0).optional(), // honeypot
  })
  .strict();

export type PersonalInput = z.input<typeof personalSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
export type TrainingInput = z.input<typeof trainingSchema>;
export type PaymentInput = z.input<typeof paymentSchema>;
export type SubmissionInput = z.input<typeof submissionSchema>;

export function normalizePhone(v: string) {
  return cleanPhone(v);
}

/** Map zod issues to a flat { field: message } record (first message per field). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.at(-1)?.toString() ?? "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
