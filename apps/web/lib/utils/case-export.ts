import * as XLSX from "xlsx";
import { CASE_TYPE_LABEL, STATUS_LABEL, type Case } from "@/lib/types/portal";

function rowsFor(cases: Case[]): (string | number)[][] {
  return [
    ["Case #", "Matter", "Client", "Reviewer", "Case Type", "Status", "Due", "Created"],
    ...cases.map((c) => [
      c.caseNumber,
      c.matterName,
      c.owner?.name ?? "—",
      c.assignedReviewer?.name ?? "Unassigned",
      CASE_TYPE_LABEL[c.caseType],
      STATUS_LABEL[c.status],
      c.dueAt ? new Date(c.dueAt).toLocaleDateString() : "—",
      new Date(c.createdAt).toLocaleDateString(),
    ]),
  ];
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadCasesCsv(cases: Case[], fileName = "cases.csv") {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsFor(cases));
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), fileName);
}

export function downloadCasesExcel(cases: Case[], fileName = "cases.xlsx") {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsFor(cases));
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 26 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");
  XLSX.writeFile(workbook, fileName);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// No PDF library in the app — mirrors invoice-print.ts / user-export.ts's
// approach of opening a print-ready window and letting the browser's own
// "Save as PDF" destination produce the file.
export function printCasesPdf(cases: Case[], title = "Cases") {
  const win = window.open("", "_blank", "width=1000,height=1100");
  if (!win) return;

  const rows = cases
    .map(
      (c) => `
      <tr>
        <td>${escapeHtml(c.caseNumber)}</td>
        <td>${escapeHtml(c.matterName)}</td>
        <td>${escapeHtml(c.owner?.name ?? "—")}</td>
        <td>${escapeHtml(c.assignedReviewer?.name ?? "Unassigned")}</td>
        <td>${CASE_TYPE_LABEL[c.caseType]}</td>
        <td>${STATUS_LABEL[c.status]}</td>
        <td>${c.dueAt ? new Date(c.dueAt).toLocaleDateString() : "—"}</td>
        <td>${new Date(c.createdAt).toLocaleDateString()}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #384633; margin: 24px; }
  h1 { font-size: 18px; color: #00453A; margin-bottom: 4px; }
  p.meta { font-size: 12px; color: #6B7568; margin-top: 0; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #00453A; color: #fff; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
  tbody td { padding: 8px 10px; font-size: 11px; border-bottom: 1px solid #DCE9E2; }
  tbody tr:nth-child(even) { background: #F7F9F9; }
</style>
</head>
<body>
  <h1>Smart Med Records — ${escapeHtml(title)}</h1>
  <p class="meta">${cases.length} case${cases.length === 1 ? "" : "s"} — exported ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr><th>Case #</th><th>Matter</th><th>Client</th><th>Reviewer</th><th>Case Type</th><th>Status</th><th>Due</th><th>Created</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => win.print();
}
