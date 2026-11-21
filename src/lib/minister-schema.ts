import { z } from "zod";

const NG_PHONE = /^(\+?234|0)[789][01]\d{8}$/;
const clean = (s: string) => s.replace(/[\s()-]/g, "");
const req = (label: string, max = 150) => z.string().trim().min(1, `${label} is required`).max(max);

export const MINISTER_TITLES = ["Pastor", "Reverend", "Bishop", "Evangelist", "Prophet", "Apostle", "Deacon", "Deaconess", "Elder", "Minister", "Other"] as const;

/** Church Minister registration — shared by the public form and the server. */
export const ministerSchema = z.object({
  name: req("Full name", 120),
  title: req("Title", 60),
  church: req("Church/Denomination"),
  gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Select your gender" }) }),
  address: req("Address", 300).refine((v) => v.length >= 5, "Enter your full address"),
  phone: req("Phone number", 20).refine((v) => NG_PHONE.test(clean(v)), "Enter a valid Nigerian phone number, e.g. 08012345678"),
  whatsapp: z.string().trim().max(20).refine((v) => v === "" || NG_PHONE.test(clean(v)), "Enter a valid WhatsApp number").optional(),
  website: z.string().max(0).optional(), // honeypot
});
export type MinisterInput = z.input<typeof ministerSchema>;
