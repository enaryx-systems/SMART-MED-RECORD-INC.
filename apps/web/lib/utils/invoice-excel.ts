import * as XLSX from "xlsx";
import type { Invoice } from "@/lib/types/portal";

function formatAmount(cents: number) {
  return Number((cents / 100).toFixed(2));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

/**
 * Builds the same content as the printable invoice (letterhead block, one
 * row per line item, a total) as a real .xlsx workbook via SheetJS, and
 * triggers a browser download — the Excel counterpart to the PDF print path.
 */
export function downloadInvoiceExcel(invoice: Invoice) {
  const rows: (string | number)[][] = [
    ["SMART MED RECORDS — Invoice"],
    [],
    ["Bill To", invoice.organization?.name ?? "—"],
    ["Invoice #", invoice.number],
    ["Status", invoice.status],
    ["Issued", formatDate(invoice.createdAt)],
    ["Due", formatDate(invoice.dueAt)],
    ...(invoice.paidAt ? [["Paid", formatDate(invoice.paidAt)]] : []),
    [],
    ["Case", "Description", "Amount (USD)"],
    ...invoice.lineItems.map((li) => [
      li.case.caseNumber,
      li.description,
      formatAmount(li.amountCents),
    ]),
    ["", "Total", formatAmount(invoice.amountCents)],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 16 }, { wch: 40 }, { wch: 16 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");
  XLSX.writeFile(workbook, `${invoice.number}.xlsx`);
}
