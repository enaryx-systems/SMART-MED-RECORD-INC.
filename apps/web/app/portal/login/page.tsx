"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { login, ApiError } from "@/lib/api/client";
import { setSession } from "@/lib/auth/session";
import type { Role } from "@/lib/types/portal";

const ROLE_HOME: Record<Role, string> = {
  CLIENT: "/portal/dashboard",
  ADMIN: "/portal/admin/dashboard",
  REVIEWER: "/portal/reviewer/dashboard",
  BILLING: "/portal/finance/dashboard",
};

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login(email, password);
      setSession(session);
      router.push(ROLE_HOME[session.user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden bg-pine p-12 text-white lg:flex lg:flex-col">
        <Logo portal />
        <div className="my-auto max-w-lg">
          <span className="text-xs font-bold uppercase tracking-[.2em] text-gold">
            Secure client portal
          </span>
          <h1 className="mt-5 text-5xl leading-tight">
            Your cases, records, and insights—together.
          </h1>
          <p className="mt-6 leading-7 text-white/65">
            Track every matter from secure intake through physician-reviewed delivery.
          </p>
          <div className="mt-10 space-y-4">
            {[
              "Encrypted record upload",
              "Live case milestones and messages",
              "Source-cited AI medical intelligence",
              "Role-based access and audit logging",
            ].map((x) => (
              <div className="flex items-center gap-3 text-sm" key={x}>
                <CheckCircle2 size={18} className="text-gold" />
                {x}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <ShieldCheck size={16} /> HIPAA-aligned security controls
        </div>
      </section>

      <section className="flex items-center justify-center bg-ivory px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-10 flex justify-center">
            <Logo />
          </div>
          <h2 className="text-3xl text-pine sm:text-4xl">Welcome back.</h2>
          <p className="mt-3 text-sm text-ink/60">Sign in to your Smart Med Records workspace.</p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-left text-sm font-semibold text-ink" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-pine/25 bg-cream px-4 py-3.5 text-left outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-left text-sm font-semibold text-ink" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-2 border-pine/25 bg-cream px-4 py-3.5 pr-11 text-left outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pine px-4 py-3.5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-emerald disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 space-y-1 rounded-xl border border-mint bg-cream px-4 py-3 text-left text-xs text-ink/50">
            <p className="font-semibold text-ink/60">Demo accounts</p>
            <p>Admin: admin@smartmedrecords.com / Admin123!</p>
            <p>Reviewer: reviewer@smartmedrecords.com / Reviewer123!</p>
            <p>Billing: billing@smartmedrecords.com / Billing123!</p>
            <p>Client (Blake & Associates): client@smartmedrecords.com / Client123!</p>
            <p>Client (Harborview Legal): attorney@harborviewlegal.com / Client123!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
