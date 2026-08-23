import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Boxes,
  BriefcaseMedical,
  Check,
  Clock3,
  FileCheck2,
  FileSearch,
  FileText,
  Fingerprint,
  Gauge,
  Languages,
  LockKeyhole,
  MessageSquareText,
  Mic2,
  Network,
  ScanText,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  TimerReset,
  UploadCloud,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/website/public-header";
import { PublicFooter } from "@/components/website/public-footer";
import { NeuralBackdrop } from "@/components/website/neural-backdrop";

type Feature = {
  name: string;
  description: string;
  icon: typeof Bot;
  badge?: string;
};
const core: Feature[] = [
  {
    name: "Medical Record Review",
    description:
      "Thorough, attorney-ready review of the complete medical file by trained specialists.",
    icon: FileSearch,
  },
  {
    name: "Medical Chronology",
    description:
      "A clear chronological record of every treatment, diagnosis, procedure, and provider visit.",
    icon: Clock3,
  },
  {
    name: "Narrative Summary",
    description:
      "A readable narrative that turns dense medical files into a clear, defensible case story.",
    icon: FileText,
  },
  {
    name: "Demand Letter Support",
    description:
      "Medical documentation and structured summaries built to support strong demand letters.",
    icon: FileCheck2,
  },
  {
    name: "Deposition Summary",
    description:
      "Concise deposition summaries organized around testimony, contradictions, and page references.",
    icon: MessageSquareText,
  },
  {
    name: "Medical Billing Summary",
    description: "Itemized summaries of charges, codes, and billing across every provider.",
    icon: BriefcaseMedical,
  },
  {
    name: "Physician Review",
    description:
      "Independent physician review for added clinical insight, accuracy, and credibility.",
    icon: Stethoscope,
  },
  {
    name: "Expert Medical Opinions",
    description:
      "Specialty-matched medical opinions that strengthen case evaluation and causation analysis.",
    icon: BadgeCheck,
  },
  {
    name: "Record Retrieval",
    description:
      "Managed retrieval directly from providers and facilities, with request and gap tracking.",
    icon: UploadCloud,
  },
];
const ai: Feature[] = [
  {
    name: "Instant AI Draft",
    description:
      "See a usable chronology or summary draft in minutes while licensed review continues.",
    icon: Sparkles,
    badge: "Key differentiator",
  },
  {
    name: "AI Medical Chronology",
    description:
      "Extract dates, providers, diagnoses, procedures, and treatment events into a source-linked timeline.",
    icon: Bot,
  },
  {
    name: "AI Narrative Summary",
    description:
      "AI-drafted narrative summaries refined by human reviewers for accuracy and readability.",
    icon: FileText,
  },
  {
    name: "AI Demand Letter Draft",
    description:
      "Generate a structured first-pass demand letter directly from the verified case record.",
    icon: FileCheck2,
  },
  {
    name: "AI Medical Timeline",
    description:
      "Explore the complete course of care using provider, diagnosis, procedure, and date filters.",
    icon: Activity,
  },
  {
    name: "AI Document Chat",
    description:
      "Ask natural-language questions and receive answers with exact document and page citations.",
    icon: MessageSquareText,
  },
  {
    name: "Semantic Search",
    description:
      "Search thousands of pages by clinical meaning instead of relying on exact keywords.",
    icon: Search,
  },
  {
    name: "Missing Record Detection",
    description: "Automatically surface unexplained date gaps and likely missing provider records.",
    icon: TimerReset,
  },
  {
    name: "Duplicate Record Detection",
    description: "Identify redundant documents and repeated pages before they inflate review time.",
    icon: Boxes,
  },
  {
    name: "OCR Quality Check",
    description:
      "Flag unreadable, rotated, incomplete, or low-confidence scanned pages automatically.",
    icon: ScanText,
  },
  {
    name: "Medical Entity Extraction",
    description:
      "Extract diagnoses, medications, providers, procedures, ICD/CPT codes, and facilities.",
    icon: Network,
  },
  {
    name: "Treatment Gap Detection",
    description: "Identify and cite gaps in a client’s course of treatment for reviewer attention.",
    icon: Clock3,
  },
  {
    name: "Red-Flag & Causation Highlighter",
    description:
      "Surface pre-existing conditions, contradictions, intervening events, and causation issues.",
    icon: Fingerprint,
  },
  {
    name: "Smart Source Linking",
    description:
      "Every finding links back to the exact source page for rapid verification and defensibility.",
    icon: FileSearch,
  },
];
const collaboration: Feature[] = [
  {
    name: "Secure Client Portal",
    description:
      "One intuitive, encrypted workspace for case files, updates, drafts, and final reports.",
    icon: LockKeyhole,
  },
  {
    name: "Live Case Tracker",
    description:
      "Follow Uploaded → AI Draft Ready → Under Medical Review → Final Delivered in real time.",
    icon: Gauge,
  },
  {
    name: "AI Draft + Verified Final",
    description:
      "Use the rapid AI draft internally, then receive a reviewer-certified court-ready final.",
    icon: BadgeCheck,
  },
  {
    name: "Attorney Collaboration",
    description: "Share comments, redline requests, assignments, and notes without email chains.",
    icon: Users,
  },
  {
    name: "Real-Time Messaging",
    description: "Secure case-specific conversations keep attorneys, staff, and reviewers aligned.",
    icon: MessageSquareText,
  },
  {
    name: "Reviewer Workspace",
    description:
      "Compare AI output and source records side by side with accept, edit, flag, and sign-off controls.",
    icon: Stethoscope,
  },
  {
    name: "Order Progress Tracking",
    description:
      "See milestones, deadlines, reviewer ownership, and expected delivery at a glance.",
    icon: Clock3,
  },
  {
    name: "Case Memory",
    description:
      "New records join the existing case context instead of forcing the analysis to restart.",
    icon: Bot,
  },
];
const security: Feature[] = [
  {
    name: "HIPAA-Aligned Workflows",
    description:
      "Protected-health-information workflows designed around confidentiality and minimum access.",
    icon: ShieldCheck,
  },
  {
    name: "Role-Based Access",
    description:
      "Firm-level and user-level permissions ensure each person sees only what they should.",
    icon: Users,
  },
  {
    name: "Complete Audit Logs",
    description: "Track who viewed, uploaded, edited, approved, downloaded, or shared each item.",
    icon: Fingerprint,
  },
  {
    name: "Digital Signatures",
    description:
      "Reviewer sign-off and e-signature-ready exports are built into the delivery workflow.",
    icon: FileCheck2,
  },
  {
    name: "Automated Invoicing",
    description: "Generate accurate usage and case-based invoices directly from completed work.",
    icon: BriefcaseMedical,
  },
  {
    name: "API Integrations",
    description:
      "Connect legal practice platforms, e-discovery tools, and record sources through secure APIs.",
    icon: Network,
  },
];
const insights: Feature[] = [
  {
    name: "Analytics Dashboard",
    description: "Monitor volume, productivity, turnaround, reviewer edit rates, and hours saved.",
    icon: BarChart3,
  },
  {
    name: "Client Satisfaction Reports",
    description: "Capture feedback and track delivery quality across services, matters, and teams.",
    icon: BadgeCheck,
  },
  {
    name: "Reviewer Productivity",
    description: "Measure verification speed, exception rates, workloads, and quality trends.",
    icon: Gauge,
  },
];
const roadmap: Feature[] = [
  {
    name: "Case Value Insights",
    description: "AI-assisted case insights presented with attorney-facing disclaimers.",
    icon: BarChart3,
    badge: "Coming soon",
  },
  {
    name: "IME Coordination",
    description: "Scheduling and workflow management for independent medical examinations.",
    icon: Stethoscope,
    badge: "Coming soon",
  },
  {
    name: "Mobile App",
    description: "Secure case access and updates from a dedicated mobile experience.",
    icon: Smartphone,
    badge: "Coming soon",
  },
  {
    name: "Multi-language Translation",
    description: "Translation support for records, summaries, and case documentation.",
    icon: Languages,
    badge: "Coming soon",
  },
  {
    name: "Voice-to-Case Notes",
    description: "Hands-free case notes captured directly by voice.",
    icon: Mic2,
    badge: "Coming soon",
  },
  {
    name: "White-Label Portal",
    description: "Enterprise firms can present the portal using their own approved branding.",
    icon: Boxes,
    badge: "Roadmap",
  },
];

function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
      {items.map((f, i) => (
        <article
          key={f.name}
          className="group relative overflow-hidden rounded-2xl border border-emerald/30 bg-[linear-gradient(145deg,rgba(234,242,238,0.86),rgba(220,233,226,0.62))] p-6 shadow-[0_22px_48px_rgba(0,69,58,0.11),0_5px_14px_rgba(0,69,58,0.07),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[18px] backdrop-saturate-[1.35] transition duration-300 [&:nth-child(even)]:bg-[linear-gradient(145deg,rgba(220,233,226,0.94),rgba(202,224,214,0.7))] hover:-translate-y-1.5 hover:border-emerald/[.52] hover:shadow-[0_28px_58px_rgba(0,69,58,0.16),0_8px_18px_rgba(0,69,58,0.08),inset_0_1px_0_rgba(255,255,255,0.96)] max-sm:min-h-[145px] max-sm:p-[0.7rem]"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/30" />
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-pine/10 bg-cream text-pine shadow-sm max-sm:h-8 max-sm:w-8 max-sm:rounded-[0.55rem] max-sm:[&>svg]:h-[14px] max-sm:[&>svg]:w-[14px]">
              <f.icon size={21} />
            </span>
            {f.badge && (
              <span className="rounded-full border border-emerald/25 bg-cream px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald max-sm:px-[0.4rem] max-sm:py-[0.2rem] max-sm:text-[6px] max-sm:leading-[8px] max-sm:tracking-[0.04em]">
                {f.badge}
              </span>
            )}
          </div>
          <h3 className="relative mt-5 font-sans text-base font-bold text-pine max-sm:mt-[0.7rem] max-sm:text-[9px] max-sm:leading-[11px]">
            {f.name}
          </h3>
          <p className="relative mt-3 text-sm leading-6 text-slate-600 max-sm:mt-[0.4rem] max-sm:text-[7px] max-sm:leading-[11px]">
            {f.description}
          </p>
        </article>
      ))}
    </div>
  );
}
function Section({
  number,
  eyebrow,
  title,
  copy,
  items,
}: {
  number: string;
  eyebrow: string;
  title: string;
  copy: string;
  items: Feature[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[120px_1fr]">
        <div className="text-6xl font-bold text-emerald/30">{number}</div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-4xl text-pine">{title}</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">{copy}</p>
        </div>
      </div>
      <FeatureGrid items={items} />
    </section>
  );
}

export default function Features() {
  return (
    <>
      <PublicHeader />
      <main className="bg-ivory">
        <section className="relative overflow-hidden border-b border-mint bg-[linear-gradient(rgba(6,63,54,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,63,54,0.035)_1px,transparent_1px)] bg-[length:32px_32px]">
          <div className="absolute right-0 top-0 h-full w-2/5 bg-gradient-to-l from-mint/80 to-transparent" />
          <NeuralBackdrop className="opacity-[.10] sm:opacity-[.24]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1fr_420px] lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald/15 bg-mint px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-pine">
                <Sparkles size={14} /> One case-intelligence platform
              </span>
              <h1 className="mt-7 max-w-3xl text-5xl leading-[1.08] text-pine md:text-6xl">
                See the chronology in minutes. Trust the <span className="text-gold">final</span> in court.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Instant AI drafts give your team answers now. Licensed medical <span className="text-gold font-medium">reviewers</span> verify,
                refine, and certify the court-ready final—all in one secure workspace.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <Link
                  href="/login"
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-4 text-center font-semibold text-cream shadow-lg max-sm:gap-1 max-sm:rounded-lg max-sm:!px-2 max-sm:!py-2.5 max-sm:!text-[9px] max-sm:leading-tight"
                >
                  Explore the portal
                  <ArrowRight className="shrink-0 max-sm:h-3 max-sm:w-3" size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-w-0 items-center justify-center rounded-xl border border-pine/25 bg-cream px-6 py-4 text-center font-semibold text-pine shadow-sm max-sm:rounded-lg max-sm:!px-2 max-sm:!py-2.5 max-sm:!text-[9px] max-sm:leading-tight"
                >
                  Request a free sample
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl lg:h-[420px]">
              <img
                src="/images/website/resources-hero.png"
                alt="Secure medical records transformed into a source-linked chronology and verified by a physician for legal use"
                className="aspect-[4/5] w-full object-cover lg:aspect-auto lg:h-full"
              />
              <div className="absolute right-6 top-6 rounded-full border border-white/60 bg-ivory/85 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald shadow-card backdrop-blur">
                Source-linked · Physician verified
              </div>
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-emerald/[.34] bg-[linear-gradient(145deg,rgba(247,249,249,0.88),rgba(220,233,226,0.76))] px-5 py-4 text-pine shadow-[0_20px_44px_rgba(0,69,58,0.18),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-[20px] backdrop-saturate-[1.4]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald text-white shadow-card">
                    <FileCheck2 size={19} />
                  </span>
                  <div>
                    <b className="block text-sm text-pine">From chronology to proof</b>
                    <span className="mt-1 block text-xs text-[#527068]">
                      Faster draft. Human-reviewed final.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Section
          number="01"
          eyebrow="Expert foundation"
          title="Core medical-legal services"
          copy="Human expertise remains the foundation: clear, defensible review and documentation for every kind of matter."
          items={core}
        />
        <div className="border-y border-mint bg-mint/40">
          <Section
            number="02"
            eyebrow="Speed with accountability"
            title="AI-powered case intelligence"
            copy="AI handles the first pass, links every insight to its source, and directs reviewers to the facts that deserve attention. Human verification stays built into the workflow."
            items={ai}
          />
        </div>
        <Section
          number="03"
          eyebrow="One shared workspace"
          title="Case management and collaboration"
          copy="Move the entire matter from email into a live portal where attorneys, paralegals, case managers, reviewers, and physicians work from the same record."
          items={collaboration}
        />
        <div className="border-y border-mint bg-[#EAF2EE]">
          <Section
            number="04"
            eyebrow="Protected by design"
            title="Security, compliance and administration"
            copy="Role-aware controls, traceable activity, encrypted workflows, and operational tools keep every matter protected and audit-ready."
            items={security}
          />
        </div>
        <Section
          number="05"
          eyebrow="Operational clarity"
          title="Insights and reporting"
          copy="Understand performance, quality, workload, and turnaround across the full caseload—without building a separate reporting process."
          items={insights}
        />
        <section className="border-y border-mint bg-pine text-cream">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[.2em] text-mint">
                Clearly marked roadmap
              </span>
              <h2 className="mt-3 text-4xl">What we’re building next.</h2>
              <p className="mt-4 leading-7 text-cream/65">
                These capabilities are planned or under evaluation and are not presented as
                currently available functionality.
              </p>
            </div>
            <FeatureGrid items={roadmap} />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-3xl border border-[#B8D5CC] bg-cream p-8 shadow-table md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
                  From pages to proof
                </span>
                <h2 className="mt-3 text-4xl text-pine">
                  Put a live case workspace in front of your team.
                </h2>
                <p className="mt-4 text-slate-600">
                  Upload a sample record set and see the instant-draft and verified-final workflow
                  in action.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-4 font-semibold text-cream"
              >
                Request a demonstration <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
