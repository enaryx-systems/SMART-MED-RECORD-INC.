import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  Clock3,
  FileSearch,
  Headphones,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UploadCloud,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/website/public-header";
import { PublicFooter } from "@/components/website/public-footer";
import { services } from "@/lib/data/services";

const serviceIcons = [
  FileSearch,
  MessageSquareText,
  FileSearch,
  MessageSquareText,
  BadgeCheck,
  Stethoscope,
  Users,
  UploadCloud,
];

const trustPoints = [
  [Bot, "AI assisted", "Fast, accurate insights"],
  [Stethoscope, "Physician reviewed", "Board-certified oversight"],
  [Clock3, "24–48 hours", "Reliable delivery"],
  [LockKeyhole, "Secure & encrypted", "Protection by design"],
  [Headphones, "Dedicated support", "A real team, always"],
  [FileSearch, "Source-linked findings", "Every insight stays traceable"],
  [ShieldCheck, "Audit-ready workflow", "Accountability from intake to delivery"],
  [BadgeCheck, "Quality verified", "Human review before delivery"],
] as const;

export default function Home() {
  return (
    <main>
      <PublicHeader />
      <section className="relative overflow-hidden bg-ivory">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 top-0 w-[760px] max-w-[65vw] opacity-[.12] sm:opacity-[.30]"
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 760 720"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g stroke="#00856F" strokeWidth="1">
              <path d="M92 42 196 88 302 48 408 112 530 62 664 104" />
              <path d="M48 142 164 180 278 130 392 196 510 148 704 190" />
              <path d="M100 268 212 224 330 286 452 232 572 294 730 250" />
              <path d="M36 360 176 324 286 378 420 326 548 374 690 338" />
              <path d="M82 494 194 452 320 516 446 462 586 522 724 476" />
              <path d="M28 642 158 590 282 660 410 596 550 664 704 610" />
              <path d="M92 42 48 142 100 268 36 360" />
              <path d="M196 88 164 180 212 224 176 324" />
              <path d="M302 48 278 130 330 286 286 378" />
              <path d="M408 112 392 196 452 232 420 326" />
              <path d="M530 62 510 148 572 294 548 374" />
              <path d="M664 104 704 190 730 250 690 338" />
              <path d="M36 360 82 494 28 642M176 324 194 452 158 590M286 378 320 516 282 660M420 326 446 462 410 596M548 374 586 522 550 664M690 338 724 476 704 610" />
              <path
                d="M164 180 302 48M278 130 408 112M392 196 530 62M452 232 704 190M330 286 548 374"
                strokeOpacity=".55"
              />
            </g>
            <g fill="#F7F9F9" stroke="#00856F" strokeWidth="1.4">
              <circle cx="92" cy="42" r="4" />
              <circle cx="196" cy="88" r="6" />
              <circle cx="302" cy="48" r="3.5" />
              <circle cx="408" cy="112" r="5" />
              <circle cx="530" cy="62" r="4" />
              <circle cx="664" cy="104" r="6" />
              <circle cx="48" cy="142" r="4" />
              <circle cx="164" cy="180" r="3.5" />
              <circle cx="278" cy="130" r="6" />
              <circle cx="392" cy="196" r="4" />
              <circle cx="510" cy="148" r="5" />
              <circle cx="704" cy="190" r="3.5" />
              <circle cx="100" cy="268" r="5" />
              <circle cx="212" cy="224" r="3.5" />
              <circle cx="330" cy="286" r="6" />
              <circle cx="452" cy="232" r="4" />
              <circle cx="572" cy="294" r="5" />
              <circle cx="730" cy="250" r="4" />
              <circle cx="36" cy="360" r="3.5" />
              <circle cx="176" cy="324" r="5" />
              <circle cx="286" cy="378" r="4" />
              <circle cx="420" cy="326" r="6" />
              <circle cx="548" cy="374" r="3.5" />
              <circle cx="690" cy="338" r="5" />
              <circle cx="82" cy="494" r="5" />
              <circle cx="194" cy="452" r="3.5" />
              <circle cx="320" cy="516" r="6" />
              <circle cx="446" cy="462" r="4" />
              <circle cx="586" cy="522" r="5" />
              <circle cx="724" cy="476" r="4" />
              <circle cx="28" cy="642" r="3.5" />
              <circle cx="158" cy="590" r="5" />
              <circle cx="282" cy="660" r="4" />
              <circle cx="410" cy="596" r="6" />
              <circle cx="550" cy="664" r="3.5" />
              <circle cx="704" cy="610" r="5" />
            </g>
          </svg>
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-28">
          <div className="relative rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-pine">
              <Sparkles size={14} /> AI-powered medico-legal intelligence
            </div>
            <h1 className="max-w-2xl text-5xl font-medium leading-[1.06] tracking-tight text-pine md:text-6xl">
              Accurate medical insights.{" "}
              <span className="text-emerald">Stronger legal outcomes.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Save time, control costs, and build stronger cases with AI-assisted,
              physician-reviewed medical record analysis and litigation support.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-4 font-semibold text-white shadow-xl shadow-emerald/20"
              >
                <UploadCloud size={19} /> Upload records securely
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-pine/30 bg-white px-6 py-4 font-semibold text-pine"
              >
                Request a free sample <ArrowRight size={17} />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-5 text-sm sm:flex sm:gap-7">
              {[
                [ShieldCheck, "HIPAA-aligned"],
                [LockKeyhole, "Secure & encrypted"],
                [Clock3, "24–48 hour turnaround"],
                [Users, "Trusted by attorneys"],
              ].map(([I, t]) => (
                <div className="flex items-center gap-2 text-pine" key={t as string}>
                  <I size={22} />
                  <span>{t as string}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rise overflow-hidden rounded-[28px] border border-emerald/20 bg-white p-3 shadow-soft [animation-delay:.15s]">
            <img
              src="/images/website/home-hero-intelligence.png"
              alt="Secure medical records transformed by AI into a source-linked legal case timeline and verified by a physician"
              className="aspect-[3/2] w-full rounded-[20px] object-cover"
            />
            <div className="absolute right-6 top-6 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-bold text-emerald shadow-card backdrop-blur-md">
              Secure · Source-linked · Verified
            </div>
            <div className="hero-verification-card absolute bottom-6 left-6 rounded-2xl px-5 py-4 max-sm:bottom-2 max-sm:left-2 max-sm:max-w-[58%] max-sm:rounded-md max-sm:px-2 max-sm:py-1.5">
              <div className="flex items-center gap-3 max-sm:gap-1.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald text-white shadow-card max-sm:h-6 max-sm:w-6 max-sm:rounded-md">
                  <Bot className="max-sm:h-3 max-sm:w-3" size={20} />
                </span>
                <div>
                  <b className="block text-sm max-sm:!text-[8px] max-sm:!leading-[9px]">
                    AI + human review
                  </b>
                  <span className="mt-1 block text-xs text-[#527068] max-sm:mt-0 max-sm:!text-[6px] max-sm:!leading-[7px]">
                    Every insight is source-linked and verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-8 max-sm:py-3">
        <div className="relative w-full overflow-hidden border-y border-emerald/50 bg-pine shadow-[0_24px_60px_rgba(0,69,58,0.24)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-emerald/25 blur-3xl" />
          <div className="absolute -bottom-28 right-8 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
          <div className="trust-marquee relative overflow-hidden py-2 max-sm:py-1">
            <div className="trust-track flex w-max">
              {[...trustPoints, ...trustPoints].map(([Icon, title, detail], index) => (
                <article
                  aria-hidden={index >= trustPoints.length}
                  className="w-[270px] shrink-0 border-r border-white/10 p-3 text-white md:w-[300px]"
                  key={`${title}-${index}`}
                >
                  <div className="group flex min-h-[156px] flex-col items-center justify-center rounded-2xl border border-transparent px-5 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-gold/35 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(0,133,111,0.22))] hover:shadow-[0_18px_40px_rgba(0,25,21,0.28),inset_0_1px_0_rgba(255,255,255,0.18)]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-white/10 text-gold shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold/60 group-hover:bg-gold/15 group-hover:shadow-[0_12px_26px_rgba(196,151,61,0.18)]">
                      <Icon size={23} />
                    </span>
                    <b className="mt-4 text-sm text-white">{title}</b>
                    <span className="mt-1.5 text-xs leading-5 text-white/60 transition-colors group-hover:text-white/75">
                      {detail}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="services" className="relative overflow-hidden">
        <div className="absolute left-[-8rem] top-28 h-72 w-72 rounded-full bg-mint/70 blur-3xl" />
        <div className="absolute bottom-8 right-[-5rem] h-80 w-80 rounded-full bg-emerald/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
              Comprehensive services
            </span>
            <h2 className="mt-3 text-4xl text-pine md:text-5xl">
              The medical record partner your case deserves.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              From first upload to final deliverable, every workflow is designed for accuracy,
              traceability, and speed.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {services.map(([name, desc], i) => {
              const Icon = serviceIcons[i];
              return (
                <article
                  className="frost-card home-service-card group min-h-[250px] rounded-2xl p-7 transition duration-300 hover:-translate-y-1.5"
                  key={name}
                >
                  <div className="home-service-icon flex h-12 w-12 items-center justify-center rounded-xl border border-emerald/15 bg-cream/90 text-pine shadow-card">
                    <Icon size={22} />
                  </div>
                  <h3 className="home-service-title mt-6 font-sans text-base font-bold text-pine">
                    {name}
                  </h3>
                  <p className="home-service-copy mt-3 text-sm leading-6 text-slate-600">{desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="process" className="bg-[#edf6f2]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
              Simple by design
            </span>
            <h2 className="mt-3 text-4xl text-pine">From records to answers in four steps.</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {[
              ["01", "Secure upload", "Drag and drop files or connect your record source."],
              [
                "02",
                "AI organization",
                "OCR, deduplication, indexing, and clinical entity extraction.",
              ],
              ["03", "Expert review", "A qualified reviewer validates accuracy and context."],
              ["04", "Ready to use", "Download, collaborate, search, and cite every finding."],
            ].map(([n, a, b]) => (
              <div key={n}>
                <span className="text-5xl font-bold text-emerald/20">{n}</span>
                <h3 className="mt-2 font-sans text-lg font-bold text-pine">{a}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="about"
        className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8"
      >
        <div className="w-full max-w-[540px] justify-self-center overflow-hidden rounded-3xl bg-pine p-3 text-white shadow-soft lg:justify-self-start">
          <img
            src="/images/website/home-platform-intelligence.png"
            alt="AI transforming complex medical records into source-linked case intelligence for expert verification"
            className="aspect-[4/3] w-full rounded-2xl object-cover object-center"
          />
          <div className="grid grid-cols-3 gap-3 px-3 py-5 text-center">
            <div>
              <b className="text-xl">99%</b>
              <span className="block text-[11px] text-white/55">accuracy goal</span>
            </div>
            <div>
              <b className="text-xl">1,000+</b>
              <span className="block text-[11px] text-white/55">cases reviewed</span>
            </div>
            <div>
              <b className="text-xl">500+</b>
              <span className="block text-[11px] text-white/55">firms served</span>
            </div>
          </div>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
            Smarter review. Stronger cases.
          </span>
          <h2 className="mt-3 text-4xl text-pine">
            AI-powered intelligence, grounded in human expertise.
          </h2>
          <p className="mt-6 leading-7 text-slate-600">
            Our platform transforms thousands of disorganized pages into a clear, reviewable case
            story. Every important conclusion keeps its source, so your team can move quickly
            without losing defensibility.
          </p>
          <ul className="mt-7 space-y-4">
            {[
              "Search across every document and exact source page",
              "Automatically flag missing, duplicate, and low-quality records",
              "Collaborate with case managers, reviewers, and physicians",
              "Keep a complete role-based audit trail",
            ].map((x) => (
              <li className="flex gap-3 text-sm" key={x}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-emerald">
                  <Check size={14} />
                </span>
                {x}
              </li>
            ))}
          </ul>
          <Link
            href="/features"
            className="mt-8 inline-flex items-center gap-2 font-semibold text-emerald"
          >
            Explore all platform features <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section id="security" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-pine px-7 py-12 text-white md:px-12">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[.2em] text-gold">
                Security & confidentiality
              </span>
              <h2 className="mt-3 text-3xl">Your most sensitive records stay protected.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">
                Encryption in transit and at rest, least-privilege access, secure upload workflows,
                audit logging, and configurable retention controls.
              </p>
            </div>
            <Link
              href="/contact"
              className="rounded-xl bg-white px-6 py-4 text-center font-semibold text-pine"
            >
              Talk to security
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
