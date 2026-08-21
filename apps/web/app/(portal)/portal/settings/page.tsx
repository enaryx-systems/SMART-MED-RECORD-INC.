"use client";
import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/portal/page-heading";
import { useSession } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/lib/types/portal";
export default function Settings() {
  const [saved, setSaved] = useState(false);
  const { session } = useSession();
  const user = session?.user;
  return (
    <>
      <PageHeading
        eyebrow="Workspace preferences"
        title="Settings"
        description="Manage your profile, notifications, security, and integrations."
      />
      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="space-y-1 rounded-2xl border bg-white p-3 self-start">
          {["Profile", "Notifications", "Security", "Integrations", "Data retention"].map(
            (x, i) => (
              <button
                className={`w-full rounded-lg px-3 py-2.5 text-left text-xs ${i === 0 ? "border border-gold/30 bg-cream font-semibold text-pine" : "hover:bg-mint/50"}`}
                key={x}
              >
                {x}
              </button>
            ),
          )}
        </nav>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
          className="rounded-2xl border bg-white p-7"
        >
          <h2 className="font-sans text-lg font-bold text-pine">Profile information</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-semibold">
              Full name
              <input
                defaultValue={user?.name}
                className="mt-2 w-full rounded-lg border p-3 text-sm"
              />
            </label>
            <label className="text-xs font-semibold">
              Work email
              <input
                defaultValue={user?.email}
                className="mt-2 w-full rounded-lg border p-3 text-sm"
              />
            </label>
            <label className="text-xs font-semibold">
              Firm
              <input
                defaultValue={user?.firm ?? ""}
                className="mt-2 w-full rounded-lg border p-3 text-sm"
              />
            </label>
            <label className="text-xs font-semibold">
              Role
              <input
                disabled
                defaultValue={user ? ROLE_LABEL[user.role] : ""}
                className="mt-2 w-full rounded-lg border bg-slate-50 p-3 text-sm text-slate-500"
              />
            </label>
          </div>
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald" />
              <div>
                <b className="block text-sm">Multi-factor authentication</b>
                <span className="text-xs text-slate-400">Required by your organization</span>
              </div>
              <span className="ml-auto rounded-full bg-emerald/10 px-3 py-1 text-[10px] font-semibold text-emerald">
                Enabled
              </span>
            </div>
          </div>
          <button className="mt-7 rounded-lg bg-emerald px-5 py-3 text-xs font-semibold text-white">
            Save changes
          </button>
          {saved && (
            <span className="ml-4 inline-flex items-center gap-1 text-xs text-emerald">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
        </form>
      </div>
    </>
  );
}
