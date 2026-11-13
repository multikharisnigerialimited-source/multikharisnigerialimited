import type { Registration } from "./admin-data";
import { categoryLabel } from "./admin-data";

const COLUMNS: [string, (r: Registration) => string][] = [
  ["Reference", (r) => r.reference],
  ["Status", (r) => r.status],
  ["Submitted", (r) => new Date(r.created_at).toLocaleString("en-NG")],
  ["Surname", (r) => r.surname],
  ["First Name", (r) => r.first_name],
  ["Other Names", (r) => r.other_names ?? ""],
  ["Gender", (r) => r.gender],
  ["Date of Birth", (r) => r.date_of_birth],
  ["Phone", (r) => r.phone],
  ["WhatsApp", (r) => r.whatsapp ?? ""],
  ["Email", (r) => r.email],
  ["Home Address", (r) => r.address],
  ["Category", (r) => categoryLabel(r.category)],
  ["Institution", (r) => r.institution],
  ["Course/Discipline", (r) => r.discipline],
  ["State Code", (r) => r.state_code ?? ""],
  ["Call-up Number", (r) => r.callup_number ?? ""],
  ["PPA", (r) => r.ppa ?? ""],
  ["Level of Study", (r) => r.level_of_study ?? ""],
  ["Matric Number", (r) => r.matric_number ?? ""],
  ["Selected Courses", (r) => r.courses.join("; ")],
  ["Training Mode", (r) => r.training_mode],
  ["Training Schedule", (r) => r.training_schedule],
  ["Training Location", (r) => r.training_location ?? ""],
];

function csvCell(v: string) {
  // Neutralise spreadsheet formula injection and quote every cell.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Registration[]) {
  const header = COLUMNS.map(([h]) => csvCell(h)).join(",");
  const body = rows.map((r) => COLUMNS.map(([, f]) => csvCell(f(r))).join(","));
  return "\uFEFF" + [header, ...body].join("\r\n");
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCsv(rows: Registration[], fileName = "multikharis-applicants.csv") {
  downloadBlob(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }), fileName);
}

export async function exportExcel(rows: Registration[], fileName = "multikharis-applicants.xlsx") {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const data = [
    COLUMNS.map(([h]) => ({ value: h, fontWeight: "bold" as const })),
    ...rows.map((r) => COLUMNS.map(([, f]) => ({ value: f(r) }))),
  ];
  const blob = await writeXlsxFile(data).toBlob();
  downloadBlob(blob, fileName);
}
