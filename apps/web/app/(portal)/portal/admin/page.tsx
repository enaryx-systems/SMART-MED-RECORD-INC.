import { ModulePage } from "@/components/portal/module-page";
export default function Admin() {
  return (
    <ModulePage
      eyebrow="System controls"
      title="Administration"
      description="Monitor organizations, users, audit events, integrations, and queues."
      stats={[
        ["Organizations", "84"],
        ["Active users", "623"],
        ["Queue health", "Healthy"],
      ]}
      items={[
        ["Role updated: Alex Joseph", "By Jordan Smith · 10:42 AM", "Audit log"],
        ["Records export completed", "SMR-2026-1269 · 9:18 AM", "Audit log"],
        ["OCR queue autoscaled", "System · 8:50 AM", "System"],
        ["New firm workspace created", "Hamilton & Pierce · Yesterday", "Organization"],
      ]}
    />
  );
}
