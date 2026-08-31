import { Mail, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/portal/page-header";

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "support@smartmedrecords.com",
    hint: "Typical response within one business day.",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) 555-0142",
    hint: "Mon–Fri, 8am–6pm ET.",
  },
  {
    icon: MessageCircle,
    label: "Live chat",
    value: "Available from your dashboard",
    hint: "For urgent, case-specific questions.",
  },
];

export default function PortalSupportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Support"
        description="Reach out with questions about a case, an invoice, or your account, and our team will follow up promptly."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {CHANNELS.map(({ icon: Icon, label, value, hint }) => (
          <div
            key={label}
            className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-5 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]"
          >
            <Icon size={20} className="text-emerald" />
            <div className="mt-3 text-sm font-semibold text-pine">{label}</div>
            <div className="mt-1 text-sm text-ink/80">{value}</div>
            <p className="mt-2 text-xs text-ink/50">{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
