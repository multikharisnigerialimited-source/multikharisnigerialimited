// Server-only helpers for Paystack card payments. Needs the PAYSTACK_SECRET_KEY secret.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { totalFee } from "./money";

const PAYSTACK_URL = "https://api.paystack.co";

type Admin = SupabaseClient<Database>;

export class PaymentsNotConfigured extends Error {
  constructor() {
    super("Card payment isn't switched on yet. Please contact us to complete your payment.");
  }
}

export async function paystack<T>(path: string, init?: { method?: "GET" | "POST"; body?: unknown }) {
  const secretKey = process.env["PAYSTACK_SECRET_KEY"];
  if (!secretKey) throw new PaymentsNotConfigured();
  const res = await fetch(`${PAYSTACK_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(init?.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Paystack request failed [${res.status}] ${path}: ${text}`);
    throw new Error(`Paystack request failed [${res.status}]`);
  }
  const json = JSON.parse(text) as { status: boolean; message: string; data: T };
  if (!json.status) {
    console.error(`Paystack returned an error for ${path}: ${json.message}`);
    throw new Error(json.message || "Paystack request failed");
  }
  return json.data;
}

/** Current fee (kobo) for a set of courses, read from the course_fees table. */
export async function feeForCourses(admin: Admin, courses: string[]) {
  if (!courses.length) return 0;
  const { data, error } = await admin.from("course_fees").select("course, amount").in("course", courses);
  if (error) throw error;
  return totalFee(courses, Object.fromEntries((data ?? []).map((f) => [f.course, f.amount])));
}

type VerifyData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string | null;
  paid_at?: string | null;
  gateway_response?: string | null;
  authorization?: { brand?: string | null; last4?: string | null; bank?: string | null } | null;
};

export type VerifyResult = {
  status: "success" | "failed" | "abandoned" | "pending";
  amount: number;
  registrationReference: string;
};

/**
 * Re-checks a transaction directly with Paystack (never trusts the browser or webhook body)
 * and records the outcome. Marking the registration paid is idempotent.
 */
export async function verifyAndRecord(admin: Admin, txRef: string): Promise<VerifyResult | null> {
  const { data: pay, error } = await admin
    .from("payments")
    .select("id, registration_id, amount, status, registrations(reference)")
    .eq("reference", txRef)
    .maybeSingle();
  if (error) throw error;
  if (!pay) return null;
  const registrationReference = pay.registrations?.reference ?? "";

  if (pay.status === "success") return { status: "success", amount: pay.amount, registrationReference };

  const d = await paystack<VerifyData>(`/transaction/verify/${encodeURIComponent(txRef)}`);
  const amountOk = d.currency === "NGN" && d.amount >= pay.amount;
  const status: VerifyResult["status"] =
    d.status === "success" ? (amountOk ? "success" : "failed") : d.status === "failed" || d.status === "reversed" ? "failed" : d.status === "abandoned" ? "abandoned" : "pending";
  const paidAt = d.paid_at ?? new Date().toISOString();

  await admin
    .from("payments")
    .update({
      status,
      channel: d.channel ?? null,
      card_brand: d.authorization?.brand ?? null,
      card_last4: d.authorization?.last4 ?? null,
      card_bank: d.authorization?.bank ?? null,
      gateway_response: d.status === "success" && !amountOk ? "Amount or currency mismatch" : (d.gateway_response ?? null),
      paid_at: status === "success" ? paidAt : null,
    })
    .eq("id", pay.id);

  if (status === "success") {
    await admin
      .from("registrations")
      .update({ payment_status: "paid", amount_paid: d.amount, paid_at: paidAt })
      .eq("id", pay.registration_id)
      .eq("payment_status", "unpaid");
  }
  return { status, amount: d.amount, registrationReference };
}
