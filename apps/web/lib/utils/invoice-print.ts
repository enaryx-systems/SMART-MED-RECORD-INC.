import type { Invoice } from "@/lib/types/portal";

function formatAmount(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Opens a self-contained, print-ready invoice document in a new tab and
 * triggers the browser's print dialog — the "Save as PDF" destination there
 * is the download path, since no server-side PDF pipeline exists yet.
 * Layout follows a standard banded-header / info-grid / itemized-table /
 * banded-footer invoice structure, in the portal's own pine/emerald/gold
 * palette rather than the plain black-and-orange of a generic template.
 */
export function openInvoicePrintWindow(invoice: Invoice) {
  const win = window.open("", "_blank", "width=850,height=1100");
  if (!win) return;

  // The dark-bg logo variant (light-on-transparent) is the one meant to sit
  // on a colored band — same asset the portal header uses on its pine bar.
  const logoUrl = `${window.location.origin}/images/brand/dark_bg_logo-removebg-preview.png`;

  const lineItemRows = invoice.lineItems
    .map(
      (li, i) => `
      <tr class="${i % 2 === 1 ? "alt" : ""}">
        <td>${escapeHtml(li.case.caseNumber)}</td>
        <td>${escapeHtml(li.description)}</td>
        <td class="right">${formatAmount(li.amountCents)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${invoice.number}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #384633; margin: 0; }
  .sheet { max-width: 800px; margin: 24px auto; border: 1px solid #DCE9E2; }

  .band-top {
    background: linear-gradient(135deg, #00453A, #00856F);
    color: #fff;
    padding: 28px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .band-top .brand { display: flex; align-items: center; gap: 12px; }
  .band-top img { height: 44px; }
  .band-top .brand-text .name { font-size: 17px; font-weight: 700; letter-spacing: 0.06em; }
  .band-top .brand-text .tagline { font-size: 10px; letter-spacing: 0.12em; color: #DCE9E2; margin-top: 2px; }
  .band-top .invoice-label { text-align: right; }
  .band-top .invoice-label .tag { font-size: 11px; letter-spacing: 0.15em; color: #DCE9E2; }
  .band-top .invoice-label .number { font-size: 20px; font-weight: 700; margin-top: 2px; }

  .content { padding: 32px 40px; }

  .two-col { display: flex; justify-content: space-between; gap: 24px; }
  .two-col .block .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #00856F; font-weight: 700; }
  .two-col .block .value { font-size: 14px; margin-top: 4px; line-height: 1.5; }

  .status { display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .paid { background: #DCE9E2; color: #00856F; }
  .pending { background: #f6ecd9; color: #b78a3d; }

  .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1.5px solid #DCE9E2; border-radius: 8px; overflow: hidden; margin-top: 28px; }
  .info-grid .cell { padding: 10px 14px; border-right: 1.5px solid #DCE9E2; }
  .info-grid .cell:last-child { border-right: none; }
  .info-grid .cell .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: #6B7568; }
  .info-grid .cell .value { font-size: 13px; font-weight: 700; color: #00453A; margin-top: 2px; }

  table { width: 100%; border-collapse: collapse; margin-top: 28px; }
  thead th { background: #00453A; color: #fff; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
  thead th.right, td.right { text-align: right; }
  tbody td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #DCE9E2; }
  tbody tr.alt { background: #F7F9F9; }
  tfoot td { padding: 12px; font-size: 15px; font-weight: 700; color: #00453A; border-top: 2px solid #00453A; }

  .band-bottom {
    background: linear-gradient(135deg, #B78A3D, #8A6425);
    color: #fff;
    text-align: center;
    padding: 18px 40px;
    font-size: 12px;
  }
  .band-bottom .thanks { font-size: 14px; font-weight: 700; letter-spacing: 0.04em; }
  .band-bottom .note { margin-top: 4px; opacity: 0.85; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="band-top">
      <div class="brand">
        <img src="${logoUrl}" alt="" />
        <div class="brand-text">
          <div class="name">SMART MED RECORDS</div>
          <div class="tagline">MEDICAL-LEGAL INTELLIGENCE</div>
        </div>
      </div>
      <div class="invoice-label">
        <div class="tag">INVOICE</div>
        <div class="number">${escapeHtml(invoice.number)}</div>
      </div>
    </div>

    <div class="content">
      <div class="two-col">
        <div class="block">
          <div class="label">From</div>
          <div class="value">
            Smart Med Records Inc.<br />
            Medical-Legal Records &amp; Intelligence
          </div>
        </div>
        <div class="block" style="text-align: right;">
          <div class="label">Bill To</div>
          <div class="value">${escapeHtml(invoice.organization?.name ?? "—")}</div>
          <span class="status ${invoice.status === "PAID" ? "paid" : "pending"}">${invoice.status}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="cell">
          <div class="label">Invoice Date</div>
          <div class="value">${formatDate(invoice.createdAt)}</div>
        </div>
        <div class="cell">
          <div class="label">Due Date</div>
          <div class="value">${formatDate(invoice.dueAt)}</div>
        </div>
        <div class="cell">
          <div class="label">Cases Billed</div>
          <div class="value">${invoice.lineItems.length}</div>
        </div>
        <div class="cell">
          <div class="label">${invoice.paidAt ? "Paid" : "Balance"}</div>
          <div class="value">${invoice.paidAt ? formatDate(invoice.paidAt) : formatAmount(invoice.amountCents)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>Case</th><th>Description</th><th class="right">Amount</th></tr>
        </thead>
        <tbody>
          ${lineItemRows}
        </tbody>
        <tfoot>
          <tr><td></td><td>Total</td><td class="right">${formatAmount(invoice.amountCents)}</td></tr>
        </tfoot>
      </table>
    </div>

    <div class="band-bottom">
      <div class="thanks">Thank you for choosing Smart Med Records</div>
      <div class="note">Questions about this invoice? Contact billing@smartmedrecords.com</div>
    </div>
  </div>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => win.print();
}
