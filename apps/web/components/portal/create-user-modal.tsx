"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Copy, Mail, Send, User, X } from "lucide-react";
import { createUser, fetchOrganizationOptions } from "@/lib/api/client";
import { Dropdown } from "@/components/portal/dropdown";
import { Button } from "@/components/portal/button";
import { TextInput } from "@/components/portal/text-input";
import { ROLE_LABEL, type Role } from "@/lib/types/portal";
import { generateTempPassword } from "@/lib/utils/temp-password";

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABEL[r],
}));

const INTERNAL_ROLES: Role[] = ["ADMIN", "REVIEWER", "BILLING"];

const STEPS = [
  { n: 1, label: "User Details" },
  { n: 2, label: "Review & Send" },
];

function copyField(value: string, onDone: () => void) {
  navigator.clipboard?.writeText(value);
  onDone();
}

export function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [orgId, setOrgId] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const { data: orgOptions } = useQuery({
    queryKey: ["organization-options"],
    queryFn: fetchOrganizationOptions,
    enabled: open,
  });

  const orgFormOptions = INTERNAL_ROLES.includes(role)
    ? [{ value: "org_internal", label: "Smart Med Records — Internal" }]
    : (orgOptions ?? []).map((o) => ({ value: o.id, label: o.name }));

  function reset() {
    setStep(1);
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("CLIENT");
    setOrgId("");
    setTempPassword(generateTempPassword());
    setError("");
    setCopiedEmail(false);
    setCopiedPassword(false);
  }

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    onClose();
  }

  const name = `${firstName.trim()} ${lastName.trim()}`.trim();

  const createMutation = useMutation({
    mutationFn: () =>
      createUser({
        name,
        email,
        password: tempPassword,
        role,
        organizationId: INTERNAL_ROLES.includes(role) ? "org_internal" : orgId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleClose();
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Could not create user."),
  });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function goToReview() {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Fill in first name, last name, and email.");
      return;
    }
    if (!INTERNAL_ROLES.includes(role) && !orgId) {
      setError("Choose an organization.");
      return;
    }
    setStep(2);
  }

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-ink/40 px-4" onClick={handleClose}>
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)] transition-colors duration-fast hover:bg-black"
        >
          <X size={16} />
        </button>

        <div role="dialog" aria-modal="true" className="max-h-[90vh] overflow-y-auto rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_24px_60px_rgba(0,69,58,0.25)]">
          <h3 className="text-lg font-bold text-pine">Add New User</h3>
          <p className="mt-1 text-sm text-ink/60">Create a user account and send invite.</p>

          <ol className="mt-5 flex items-center">
            {STEPS.map((s, i) => {
              const done = s.n < step;
              const active = s.n === step;
              return (
                <li key={s.n} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-emerald text-white"
                          : active
                            ? "border-2 border-emerald text-emerald"
                            : "border-2 border-pine/20 text-ink/40"
                      }`}
                    >
                      {done ? <Check size={13} /> : s.n}
                    </span>
                    <span className={`text-sm font-semibold ${active || done ? "text-pine" : "text-ink/40"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-3 h-[2px] flex-1 rounded-full ${done ? "bg-emerald" : "bg-pine/15"}`} />
                  )}
                </li>
              );
            })}
          </ol>

          {step === 1 ? (
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                goToReview();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">First Name</label>
                  <div className="relative">
                    <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
                    <TextInput
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Last Name</label>
                  <div className="relative">
                    <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
                    <TextInput
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Thompson"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Work Email</label>
                <div className="relative">
                  <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
                  <TextInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.thompson@company.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Role</label>
                  <Dropdown
                    value={role}
                    onChange={(v) => {
                      setRole(v as Role);
                      setOrgId("");
                    }}
                    options={ROLE_OPTIONS}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Organization</label>
                  <Dropdown
                    value={INTERNAL_ROLES.includes(role) ? "org_internal" : orgId}
                    onChange={setOrgId}
                    options={orgFormOptions}
                    placeholder="Choose organization"
                  />
                </div>
              </div>

              {(firstName.trim() || lastName.trim() || email.trim()) && (
                <div className="rounded-xl border border-pine/15 bg-cream/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <User size={14} className="text-emerald" />
                    Auto-generated credentials
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-ink/50">Email</span>
                    <span className="font-medium text-ink">{email || "—"}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-ink/50">Temp. Password</span>
                    <span className="font-mono tracking-widest text-ink">{"•".repeat(10)}</span>
                  </div>
                  <p className="mt-2 text-xs text-ink/45">User will be prompted to change password on first login.</p>
                </div>
              )}

              {error && <p className="text-sm text-red-700">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Continue
                  <ChevronRight size={15} />
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-pine/15 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <User size={14} className="text-ink/40" />
                  User Details
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-ink/40">Full Name</div>
                    <div className="mt-0.5 text-sm font-semibold text-ink">{name}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-ink/40">Email</div>
                    <div className="mt-0.5 break-all text-sm font-semibold text-ink">{email}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-ink/40">Role</div>
                    <div className="mt-0.5 text-sm font-semibold text-ink">{ROLE_LABEL[role]}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-ink/40">Organization</div>
                    <div className="mt-0.5 text-sm font-semibold text-ink">
                      {INTERNAL_ROLES.includes(role)
                        ? "Smart Med Records — Internal"
                        : orgOptions?.find((o) => o.id === orgId)?.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border-2 border-pine/25 bg-white px-4 py-2.5">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink/40">Email Address</div>
                  <div className="text-sm font-semibold text-ink">{email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyField(email, () => setCopiedEmail(true))}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink/60 transition-colors duration-fast hover:bg-mint/60 hover:text-ink"
                >
                  {copiedEmail ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  Copy
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border-2 border-pine/25 bg-white px-4 py-2.5">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink/40">Temporary Password</div>
                  <div className="font-mono text-sm font-semibold tracking-widest text-ink">{"•".repeat(12)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyField(tempPassword, () => setCopiedPassword(true))}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink/60 transition-colors duration-fast hover:bg-mint/60 hover:text-ink"
                >
                  {copiedPassword ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  Copy
                </button>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-emerald/25 bg-mint/30 p-4">
                <Send size={16} className="mt-0.5 shrink-0 text-emerald" />
                <div>
                  <div className="text-sm font-bold text-pine">Welcome email will be sent automatically</div>
                  <p className="mt-1 text-xs text-ink/60">
                    {firstName || "The user"} will receive login credentials and a getting started guide at{" "}
                    {email}. They&rsquo;ll be prompted to change their password on first login.
                  </p>
                </div>
              </div>

              {error && <p className="text-sm text-red-700">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  <ChevronLeft size={14} />
                  Back
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  <Send size={14} />
                  {createMutation.isPending ? "Creating…" : "Create User & Send Invite"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
