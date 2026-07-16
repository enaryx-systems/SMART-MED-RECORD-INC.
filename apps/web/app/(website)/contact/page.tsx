import { Mail, Phone, ShieldCheck } from "lucide-react";
import { NeuralBackdrop } from "@/components/website/neural-backdrop";
import { PublicFooter } from "@/components/website/public-footer";
import { PublicHeader } from "@/components/website/public-header";

export default function Contact() {
  return (
    <>
      <PublicHeader />
      <main className="grid-lines relative overflow-hidden bg-ivory">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-mint/70 to-transparent" />
        <NeuralBackdrop className="opacity-[.22]" />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[.2em] text-emerald">
              Start a conversation
            </span>
            <h1 className="mt-4 text-5xl text-pine">See what clarity looks like.</h1>
            <p className="mt-6 leading-7 text-slate-600">
              Tell us about your typical case and we’ll prepare a free, confidential sample
              workflow.
            </p>
            <div className="mt-10 space-y-5 text-sm font-medium text-pine">
              <div className="flex items-center gap-3">
                <Mail className="text-emerald" /> hello@smartmedrecords.com
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-emerald" /> +1 (800) 555-0164
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="shrink-0 text-emerald" /> Never include protected health
                information in this form.
              </div>
            </div>
          </div>

          <form className="relative overflow-hidden rounded-3xl border-2 border-emerald/25 bg-cream/90 p-8 shadow-[0_28px_65px_rgba(0,69,58,0.17)] backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald via-gold to-emerald" />
            <h2 className="font-sans text-2xl font-extrabold text-pine">Request a free sample</h2>
            <p className="mt-2 text-sm text-slate-500">
              Share your workflow needs and our team will follow up securely.
            </p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-pine">
                Full name
                <input
                  className="mt-2 w-full rounded-xl border bg-ivory p-3.5 font-normal outline-none focus:border-emerald"
                  placeholder="Jane Smith"
                />
              </label>
              <label className="text-sm font-semibold text-pine">
                Work email
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border bg-ivory p-3.5 font-normal outline-none focus:border-emerald"
                  placeholder="jane@firm.com"
                />
              </label>
              <label className="text-sm font-semibold text-pine">
                Firm / organization
                <input className="mt-2 w-full rounded-xl border bg-ivory p-3.5 font-normal outline-none focus:border-emerald" />
              </label>
              <label className="text-sm font-semibold text-pine">
                Phone
                <input className="mt-2 w-full rounded-xl border bg-ivory p-3.5 font-normal outline-none focus:border-emerald" />
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold text-pine">
              How can we help?
              <textarea
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border bg-ivory p-3.5 font-normal outline-none focus:border-emerald"
                placeholder="Services, average page volume, and turnaround needs…"
              />
            </label>
            <button
              type="button"
              className="mt-5 rounded-xl bg-pine px-6 py-4 font-bold text-white shadow-lg shadow-pine/20 transition-colors hover:bg-emerald"
            >
              Request my free sample
            </button>
          </form>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
