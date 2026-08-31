"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, KeyRound } from "lucide-react";
import { resetUserPassword } from "@/lib/api/client";
import { Button } from "@/components/portal/button";
import type { UserSummary } from "@/lib/types/portal";

export function ResetPasswordModal({
  user,
  onClose,
}: {
  user: UserSummary | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const resetMutation = useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
  });

  useEffect(() => {
    if (user) {
      setCopied(false);
      resetMutation.mutate(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleClose() {
    resetMutation.reset();
    onClose();
  }

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-ink/40 px-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="z-modal w-full max-w-sm rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_24px_60px_rgba(0,69,58,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint text-emerald">
            <KeyRound size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Reset password</h3>
            <p className="mt-0.5 text-sm text-ink/60">{user.name}</p>
          </div>
        </div>

        <div className="mt-5">
          {resetMutation.isPending && (
            <p className="text-sm text-ink/60">Generating a new password…</p>
          )}
          {resetMutation.isError && (
            <p className="text-sm text-red-700">
              {resetMutation.error instanceof Error
                ? resetMutation.error.message
                : "Could not reset the password."}
            </p>
          )}
          {resetMutation.data && (
            <div className="space-y-2">
              <p className="text-sm text-ink/70">
                A new temporary password was generated and emailed to {user.email}.
              </p>
              <div className="flex items-center gap-2 rounded-lg border-2 border-pine/25 bg-white px-3 py-2.5">
                <code className="flex-1 select-all font-mono text-sm text-ink">
                  {resetMutation.data.password}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(resetMutation.data!.password);
                    setCopied(true);
                  }}
                  className="shrink-0 rounded-md p-1.5 text-ink/50 transition-colors duration-fast hover:bg-mint/60 hover:text-ink"
                  aria-label="Copy password"
                >
                  {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
