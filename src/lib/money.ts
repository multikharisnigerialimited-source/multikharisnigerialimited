/** All amounts are stored in kobo (1 naira = 100 kobo). */
export type FeeMap = Record<string, number>;

export function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function nairaToKobo(naira: string | number) {
  const n = typeof naira === "number" ? naira : Number(String(naira).replace(/[₦,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Total fee (kobo) for the selected courses; courses without a fee count as 0. */
export function totalFee(courses: readonly string[], fees: FeeMap) {
  return [...new Set(courses)].reduce((sum, c) => sum + (fees[c] ?? 0), 0);
}

/** Courses in the selection that have no fee set yet. */
export function unpricedCourses(courses: readonly string[], fees: FeeMap) {
  return courses.filter((c) => !fees[c]);
}

export const TX_REF = /^MNL-\d{4}-\d{6}-[A-Z0-9]{4,16}$/;
export const REG_REF = /^MNL-\d{4}-\d{6}$/;
