// Server-only: checks an uploaded screenshot really is a payment receipt to the Multikharis account.
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { SITE } from "./site";
import { formatNaira } from "./money";

export type ReceiptCheck = {
  is_receipt: boolean;
  recipient_matches: "yes" | "no" | "unclear";
  amount_naira: number | null;
  recipient_name: string | null;
  recipient_account: string | null;
  bank: string | null;
  transaction_date: string | null;
  transaction_reference: string | null;
  reason: string;
  expected_amount: number;
  amount_ok: boolean | null;
  checked_at: string;
};

export type ReceiptVerdict = { ok: boolean; message: string; check: ReceiptCheck };

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_receipt",
    "recipient_matches",
    "amount_naira",
    "recipient_name",
    "recipient_account",
    "bank",
    "transaction_date",
    "transaction_reference",
    "reason",
  ],
  properties: {
    is_receipt: { type: "boolean", description: "True only if the image is a real payment/transfer/deposit receipt or a successful transaction screen." },
    recipient_matches: { type: "string", enum: ["yes", "no", "unclear"] },
    amount_naira: { type: ["number", "null"], description: "Amount paid in naira, as shown on the receipt." },
    recipient_name: { type: ["string", "null"] },
    recipient_account: { type: ["string", "null"], description: "Beneficiary account number as shown (may be partly masked)." },
    bank: { type: ["string", "null"], description: "Beneficiary bank." },
    transaction_date: { type: ["string", "null"] },
    transaction_reference: { type: ["string", "null"] },
    reason: { type: "string", description: "One short sentence explaining the decision, written for the applicant." },
  },
} as const;

export async function checkReceipt(dataUrl: string, expectedKobo: number): Promise<ReceiptVerdict> {
  const p = SITE.payout;
  const prompt = `You verify payment receipts for a Nigerian training company.
Look at the image and decide if it is a genuine payment receipt: a bank transfer receipt, mobile banking "transaction successful" screen, POS slip, or bank deposit slip. Screenshots of chats, selfies, documents, blank pages, edited-looking images or failed/pending transactions are NOT valid receipts.
The money must go to: account name "${p.accountName}" (may appear as "MULTIKHARIS NIGERIA LIMITED"), bank "${p.bank}" (First Bank of Nigeria / FBN), account number ${p.accountNumber}.
Set recipient_matches to "yes" if the beneficiary name or account number matches (masked numbers like 203****125 count as matching), "no" if a different beneficiary is clearly shown, "unclear" if the beneficiary isn't visible.
The expected amount is ${formatNaira(expectedKobo)}.
Return JSON only.`;

  let text = "";
  try {
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: dataUrl, detail: "high" },
          ],
        },
      ],
      text: { format: { type: "json_schema", name: "receipt_check", strict: true, schema: SCHEMA } },
    });
    text = extractText(res);
  } catch (e) {
    if (e instanceof GatewayError) console.error("receipt check failed", e.code, e.httpStatus, e.ids);
    else console.error("receipt check failed", e);
    throw new Error("We couldn't check your receipt right now. Please try again in a moment.");
  }

  let parsed: Omit<ReceiptCheck, "expected_amount" | "amount_ok" | "checked_at">;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("receipt check returned invalid JSON", text.slice(0, 300));
    throw new Error("We couldn't check your receipt right now. Please try again in a moment.");
  }

  const amountOk = parsed.amount_naira == null ? null : Math.round(parsed.amount_naira * 100) >= expectedKobo;
  const check: ReceiptCheck = {
    ...parsed,
    expected_amount: expectedKobo,
    amount_ok: amountOk,
    checked_at: new Date().toISOString(),
  };

  if (!check.is_receipt) {
    return { ok: false, check, message: `This doesn't look like a payment receipt. ${check.reason} Please upload a clear screenshot of your successful transfer.` };
  }
  if (check.recipient_matches === "no") {
    return { ok: false, check, message: `This receipt shows a payment to a different account. Payments must go to ${p.accountName} · ${p.bank} · ${p.accountNumber}.` };
  }
  if (amountOk === false) {
    return {
      ok: false,
      check,
      message: `This receipt shows ${formatNaira(Math.round((check.amount_naira ?? 0) * 100))}, but your training fee is ${formatNaira(expectedKobo)}.`,
    };
  }
  return { ok: true, check, message: "Receipt accepted. Our team will confirm your payment." };
}

function extractText(res: unknown): string {
  const r = res as { output_text?: unknown; output?: { type?: string; content?: { type?: string; text?: string }[] }[] };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  for (const item of r.output ?? []) {
    for (const c of item.content ?? []) if (c.type === "output_text" && c.text) return c.text;
  }
  return "";
}
