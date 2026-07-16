import { ModulePage } from "@/components/portal/module-page";
export default function Team() {
  return (
    <ModulePage
      eyebrow="Role-based access"
      title="Team & access"
      description="Manage members, case assignments, and least-privilege permissions."
      stats={[
        ["Active members", "18"],
        ["Pending invites", "2"],
        ["Roles configured", "6"],
      ]}
      items={[
        ["Jordan Smith", "Attorney · All firm matters", "Active"],
        ["Dr. A. Mehta", "Physician · 12 assigned cases", "Active"],
        ["Alex Joseph", "Medical reviewer · 9 cases", "Active"],
        ["Priya Rao", "Billing specialist", "Active"],
      ]}
    />
  );
}
