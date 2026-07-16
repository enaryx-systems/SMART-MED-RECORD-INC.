import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { NeuralBackdrop } from "@/components/website/neural-backdrop";
import { PublicFooter } from "@/components/website/public-footer";
import { PublicHeader } from "@/components/website/public-header";

const plans = [
  {
    name: "Per Case",
    copy: "A flexible entry point for occasional matters and sample engagements.",
    price: "Custom",
    features: [
      "Secure client portal",
      "Live case tracking",
      "Medical review services",
      "Court-ready delivery",
      "Per-case reviewer billing",
    ],
  },
  {
    name: "Firm Portal",
    copy: "For firms that want AI-draft access and one workspace for every active matter.",
    price: "Monthly",
    featured: true,
    features: [
      "Everything in Per Case",
      "Instant AI chronology drafts",
      "Unlimited case tracking",
      "Team seats and permissions",
      "Usage and time-saved analytics",
    ],
  },
  {
    name: "Volume & Enterprise",
    copy: "Predictable pricing, dedicated capacity, and stronger service guarantees.",
    price: "Volume",
    features: [
      "Everything in Firm Portal",
      "Flat per-case pricing",
      "Dedicated reviewer pod",
      "Priority SLA options",
      "API and white-label options",
    ],
  },
];

export default function Pricing() {
  return (
    <>
      <PublicHeader />
      <main className="bg-ivory">
        <section className="grid-lines relative overflow-hidden border-b border-mint bg-cream">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-mint/75 to-transparent" />
          <NeuralBackdrop className="opacity-[.22]" />
          <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center">
            <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
              Flexible engagement models
            </span>
            <h1 className="mx-auto mt-4 max-w-3xl text-5xl text-pine">
              Pricing that grows with your caseload.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
              Start case by case, add portal access as your team grows, or secure dedicated capacity
              for high-volume programs.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="grid items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                  plan.featured
                    ? "border-emerald bg-gradient-to-br from-[#e3f0eb] to-[#cedfd8] shadow-[0_28px_65px_rgba(0,69,58,0.20)]"
                    : "border-pine/15 bg-cream shadow-[0_20px_46px_rgba(0,69,58,0.11)] hover:border-emerald/45 hover:shadow-[0_28px_58px_rgba(0,69,58,0.16)]"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    plan.featured
                      ? "bg-gradient-to-r from-emerald via-gold to-emerald"
                      : "bg-gradient-to-r from-transparent via-emerald/35 to-transparent"
                  }`}
                />
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald/10 blur-2xl" />

                {plan.featured && (
                  <span className="absolute right-6 top-5 rounded-full border border-gold/35 bg-pine px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-gold shadow-card">
                    Recommended
                  </span>
                )}

                <div className="relative">
                  <h2 className="font-sans text-xl font-extrabold tracking-tight text-pine">
                    {plan.name}
                  </h2>
                  <p className="mt-3 min-h-14 text-xs font-medium leading-5 text-slate-600">
                    {plan.copy}
                  </p>
                </div>

                <div className="relative mt-5 rounded-2xl border border-emerald/15 bg-white/45 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  <b className="text-3xl font-extrabold tracking-tight text-pine">{plan.price}</b>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    pricing
                  </span>
                </div>

                <ul className="relative mt-4 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      className="flex items-center gap-2.5 border-b border-pine/10 py-2 text-xs font-medium text-ink last:border-0"
                      key={feature}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald/12 text-emerald ring-1 ring-emerald/15">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`relative mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-colors ${
                    plan.featured
                      ? "bg-pine text-white shadow-lg shadow-pine/20 hover:bg-emerald"
                      : "border-2 border-pine/20 bg-cream text-pine hover:border-pine hover:bg-pine hover:text-white"
                  }`}
                >
                  Talk to our team <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-4 rounded-2xl border border-emerald/35 bg-pine p-6 text-white shadow-[0_18px_40px_rgba(0,69,58,0.18)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold">
              <ShieldCheck size={21} />
            </span>
            <div>
              <b className="text-sm">Transparent scoping before work begins</b>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Final pricing depends on page volume, service type, turnaround, reviewer specialty,
                and integration requirements. You receive a written scope before protected records
                are processed.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
