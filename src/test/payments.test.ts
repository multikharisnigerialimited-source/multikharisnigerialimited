import { describe, expect, it } from "vitest";
import { formatNaira, nairaToKobo, totalFee, TX_REF } from "@/lib/money";
import { SITE } from "@/lib/site";

describe("payment rules", () => {
  it("sends every payment to the MULTIKHARIS First Bank account 2032300125", () => {
    expect(SITE.payout).toEqual({ accountName: "MULTIKHARIS", accountNumber: "2032300125", bank: "First Bank" });
  });

  it("charges the total of the fees for every selected course", () => {
    const fees = { "Web Design": 2_500_000, "Data Analysis": 3_000_000 };
    expect(totalFee(["Web Design", "Data Analysis"], fees)).toBe(5_500_000);
    expect(totalFee(["Web Design", "Web Design"], fees)).toBe(2_500_000);
    expect(totalFee(["Graphic Design"], fees)).toBe(0);
  });

  it("converts naira entered by the admin to kobo and rejects bad amounts", () => {
    expect(nairaToKobo("25,000")).toBe(2_500_000);
    expect(nairaToKobo("-5")).toBeNull();
    expect(nairaToKobo("abc")).toBeNull();
    expect(formatNaira(2_500_000)).toBe("₦25,000");
  });

  it("only accepts payment references tied to a registration number", () => {
    expect(TX_REF.test("MNL-2026-000123-LZ8K2Q")).toBe(true);
    expect(TX_REF.test("random-ref")).toBe(false);
  });
});
