"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ApiError, login } from "@/lib/api/client";
import { setSession } from "@/lib/auth/session";

const DEMO_ACCOUNTS = [
  { role: "Attorney / client", email: "attorney@demo.smartmedrecords.com" },
  { role: "Case manager", email: "ops@demo.smartmedrecords.com" },
  { role: "Physician reviewer", email: "physician@demo.smartmedrecords.com" },
  { role: "Medical reviewer", email: "reviewer@demo.smartmedrecords.com" },
  { role: "Billing specialist", email: "billing@demo.smartmedrecords.com" },
  { role: "Administrator", email: "admin@demo.smartmedrecords.com" },
] as const;
const DEMO_PASSWORD = "smartmed123";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login({ email, password });
      setSession(session);
      router.push("/portal/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError("");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <section className="hidden bg-pine p-12 text-white lg:flex lg:flex-col">
        <div className="flex justify-start pt-1">
          <div className="origin-top scale-[1.15]">
            <Logo portal />
          </div>
        </div>
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
      <section className="flex items-center justify-center bg-[#fbfaf6] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex w-full justify-start rounded-xl bg-pine px-3 py-2 lg:hidden">
            <div className="origin-top scale-[1.15]">
              <Logo portal />
            </div>
          </div>
          <h2 className="text-4xl text-pine">Welcome back.</h2>
          <p className="mt-3 text-sm text-slate-500">
            Sign in to your Smart Med Records workspace.
          </p>
          <form className="mt-8 space-y-5" onSubmit={submit}>
            <div>
              <label className="mb-2 block text-sm font-semibold">Email address</label>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourfirm.com"
                className="w-full rounded-xl border bg-white px-4 py-3.5 outline-none focus:border-emerald"
              />
            </div>
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-semibold">Password</label>
                <button type="button" className="text-xs text-emerald">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  required
                  minLength={6}
                  type={show ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border bg-white px-4 py-3.5 pr-12 outline-none focus:border-emerald"
                />
                <button
                  type="button"
                  className="absolute right-4 top-3.5 text-slate-400"
                  onClick={() => setShow(!show)}
                  aria-label="Show password"
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-5 py-4 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in securely"} <ArrowRight size={18} />
            </button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <LockKeyhole size={14} /> Protected by encrypted authentication
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-mint bg-mint/30 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pine/60">
              Quick demo sign-in
            </span>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  type="button"
                  key={d.email}
                  onClick={() => fillDemo(d.email)}
                  className="rounded-lg border border-mint bg-white px-3 py-2 text-left text-[11px] font-semibold text-pine hover:border-emerald hover:text-emerald"
                >
                  {d.role}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Fills the form with a seeded demo account. Password:{" "}
              <code className="rounded bg-white px-1.5 py-0.5">{DEMO_PASSWORD}</code>
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Need an account?{" "}
            <Link href="/contact" className="font-semibold text-emerald">
              Request access
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
