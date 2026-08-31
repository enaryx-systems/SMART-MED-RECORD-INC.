import * as XLSX from "xlsx";
import { ROLE_LABEL, type UserSummary } from "@/lib/types/portal";

function rowsFor(users: UserSummary[]): (string | number)[][] {
  return [
    ["Name", "Email", "Role", "Organization", "Status"],
    ...users.map((u) => [
      u.name,
      u.email,
      ROLE_LABEL[u.role],
      u.organization?.name ?? "—",
      u.isActive === false ? "Deactivated" : "Active",
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

export function downloadUsersCsv(users: UserSummary[], fileName = "users.csv") {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsFor(users));
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), fileName);
}

export function downloadUsersExcel(users: UserSummary[], fileName = "users.xlsx") {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsFor(users));
  worksheet["!cols"] = [{ wch: 22 }, { wch: 28 }, { wch: 12 }, { wch: 26 }, { wch: 14 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, fileName);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// No PDF library in the app — this mirrors invoice-print.ts's approach of
// opening a print-ready window and letting the browser's own "Save as PDF"
// destination produce the file.
export function printUsersPdf(users: UserSummary[]) {
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) return;

  const rows = users
    .map(
      (u) => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${ROLE_LABEL[u.role]}</td>
        <td>${escapeHtml(u.organization?.name ?? "—")}</td>
        <td>${u.isActive === false ? "Deactivated" : "Active"}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Users</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #384633; margin: 24px; }
  h1 { font-size: 18px; color: #00453A; margin-bottom: 4px; }
  p.meta { font-size: 12px; color: #6B7568; margin-top: 0; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #00453A; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  tbody td { padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #DCE9E2; }
  tbody tr:nth-child(even) { background: #F7F9F9; }
</style>
</head>
<body>
  <h1>Smart Med Records — Users</h1>
  <p class="meta">${users.length} user${users.length === 1 ? "" : "s"} — exported ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organization</th><th>Status</th></tr></thead>
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
