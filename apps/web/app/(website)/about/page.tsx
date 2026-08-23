import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  FileSearch,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Timer,
  Users,
} from "lucide-react";
import { PublicFooter } from "@/components/website/public-footer";
import { PublicHeader } from "@/components/website/public-header";
import { NeuralBackdrop } from "@/components/website/neural-backdrop";

const strategy = [
  {
    icon: FileSearch,
    title: "Make every fact traceable",
    copy: "We connect findings to their exact source so legal teams can move quickly without losing context or defensibility.",
  },
  {
    icon: Stethoscope,
    title: "Keep experts in the loop",
    copy: "AI organizes the first pass while trained medical reviewers and physicians verify the conclusions that matter.",
  },
  {
    icon: HeartHandshake,
    title: "Build for the whole case team",
    copy: "Attorneys, case managers, reviewers, and specialists collaborate from one secure, accountable workspace.",
  },
];

const reasons = [
  {
    icon: BadgeCheck,
    title: "Physician-reviewed quality",
    copy: "Human clinical judgment strengthens accuracy, clarity, and confidence before delivery.",
  },
  {
    icon: Bot,
    title: "AI with clear boundaries",
    copy: "Automation accelerates organization and discovery while review remains visible and accountable.",
  },
  {
    icon: ShieldCheck,
    title: "Security by design",
    copy: "Encrypted workflows, role-aware access, and audit trails help protect sensitive case information.",
  },
  {
    icon: Timer,
    title: "Reliable turnaround",
    copy: "Structured intake and parallel review help teams reach useful answers sooner.",
  },
  {
    icon: Scale,
    title: "Built for legal usefulness",
    copy: "Deliverables focus on chronology, causation, treatment, damages, and the facts attorneys need.",
  },
  {
    icon: Users,
    title: "Real human support",
    copy: "A responsive team helps with intake, workflow questions, review coordination, and delivery.",
  },
];

const workflow = [
  ["01", "Secure intake", "Records enter one protected case workspace."],
  ["02", "AI organization", "Documents are classified, indexed, and connected."],
  ["03", "Expert verification", "Medical reviewers validate important findings and sources."],
  ["04", "Defensible delivery", "Your team receives a clear, searchable case story."],
];

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-ivory">
        <section className="relative overflow-hidden border-b border-mint bg-[linear-gradient(rgba(6,63,54,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,63,54,0.035)_1px,transparent_1px)] bg-[length:32px_32px]">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-mint/70 to-transparent" />
          <NeuralBackdrop className="opacity-[.10] sm:opacity-[.26]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-pine">
                <Sparkles size={14} /> About Smart Med Records
              </span>
              <h1 className="mt-6 text-5xl leading-[1.06] text-pine md:text-6xl">
                Medical intelligence built around <span className="text-gold">human judgment.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                We help legal teams turn complex medical records into clear, source-linked case
                intelligence—faster, more securely, and with expert review built into the process.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald px-6 py-4 font-semibold text-white shadow-lg shadow-emerald/20"
                >
                  Talk with our team <ArrowRight size={17} />
                </Link>
                <Link
                  href="/features"
                  className="rounded-xl border border-pine/25 bg-cream px-6 py-4 font-semibold text-pine"
                >
                  Explore our platform
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-emerald/25 bg-cream p-3 shadow-soft">
              <img
                src="/images/website/about-team.png"
                alt="Medical and legal professionals collaborating around secure source-linked case intelligence"
                className="aspect-[16/10] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
              About the company
            </span>
            <h2 className="mt-3 text-4xl text-pine">Clear records. <span className="text-gold">Stronger case decisions.</span></h2>
          </div>
          <div className="space-y-5 text-slate-600">
            <p className="leading-7">
              Smart Med Records is a medico-legal technology and review company focused on one
              persistent problem: important case facts are often buried across thousands of
              disorganized pages. We combine secure software, structured workflows, and medical
              expertise to make those facts easier to find, understand, and use.
            </p>
            <p className="leading-7">
              Our work supports medical chronology, narrative summaries, demand preparation,
              deposition review, billing analysis, life care planning, expert medical opinions, and
              record retrieval. Every deliverable is designed to preserve the connection between an
              insight and its source.
            </p>
            <p className="leading-7">
              We believe AI should improve professional judgment—not replace it. That is why our
              approach pairs intelligent automation with trained reviewers, physician oversight,
              transparent status tracking, and real support throughout the life of a matter.
            </p>
          </div>
        </section>

        <section className="bg-pine text-white">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[.2em] text-gold">
                Our strategy
              </span>
              <h2 className="mt-3 text-4xl">
                Technology where it helps. Expertise where it matters.
              </h2>
              <p className="mt-5 leading-7 text-white/65">
                Our strategy is to reduce repetitive record work, surface the facts that deserve
                attention, and give qualified professionals better tools for careful review.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {strategy.map(({ icon: Icon, title, copy }) => (
                <article
                  className="rounded-2xl border border-white/12 bg-white/5 p-7 backdrop-blur transition hover:-translate-y-1 hover:border-gold/35 hover:bg-white/10"
                  key={title}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-5 font-sans text-base font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
              Why choose us?
            </span>
            <h2 className="mx-auto mt-3 max-w-3xl text-4xl text-pine">
              A review partner designed for accuracy, speed, and trust.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, copy }) => (
              <article
                className="rounded-2xl border border-emerald/30 bg-[linear-gradient(145deg,rgba(234,242,238,0.86),rgba(220,233,226,0.62))] p-6 shadow-[0_22px_48px_rgba(0,69,58,0.11),0_5px_14px_rgba(0,69,58,0.07),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[18px] backdrop-saturate-[1.35] [&:nth-child(even)]:bg-[linear-gradient(145deg,rgba(220,233,226,0.94),rgba(202,224,214,0.7))] hover:border-emerald/[.52] hover:shadow-[0_28px_58px_rgba(0,69,58,0.16),0_8px_18px_rgba(0,69,58,0.08),inset_0_1px_0_rgba(255,255,255,0.96)]"
                key={title}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-emerald shadow-card">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 font-sans text-base font-bold text-pine">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-mint bg-mint/45">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
                How we work
              </span>
              <h2 className="mt-3 text-4xl text-pine">One accountable path from pages to proof.</h2>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {workflow.map(([number, title, copy]) => (
                <article
                  className="rounded-2xl border border-emerald/20 bg-cream p-6 shadow-card"
                  key={number}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-xs font-bold text-white">
                    {number}
                  </span>
                  <h3 className="mt-5 font-sans text-sm font-bold text-pine">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-3xl bg-pine px-7 py-12 text-white shadow-soft md:px-12">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <span className="text-xs font-bold uppercase tracking-[.2em] text-gold">
                  See our approach in action
                </span>
                <h2 className="mt-3 text-4xl">Bring us a complex record set.</h2>
                <p className="mt-4 max-w-2xl text-white/65">
                  We will show you how a secure, source-linked, human-reviewed workflow can turn it
                  into a case story your team can use.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cream px-6 py-4 font-semibold text-pine"
              >
                Request a free sample <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
