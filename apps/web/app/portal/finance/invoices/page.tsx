import { PageHeader } from "@/components/portal/page-header";
import { InvoiceManager } from "@/components/portal/invoice-manager";

export default function FinanceInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Case numbers and organizations only — no case documents or clinical content."
      />
      <InvoiceManager />
    </div>
  );
}
