import { PageHeader } from "@/components/portal/page-header";
import { InvoiceManager } from "@/components/portal/invoice-manager";

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Issue, edit, and reconcile invoices across every organization."
      />
      <InvoiceManager />
    </div>
  );
}
