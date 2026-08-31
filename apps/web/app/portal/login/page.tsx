"use client";

import { SignIn } from "@clerk/nextjs";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function PortalLoginPage() {
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
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center">
            <Logo />
          </div>
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/portal"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                cardBox: "w-full shadow-none",
                card: "w-full rounded-2xl border-2 border-pine/15 bg-white px-6 py-8 shadow-none",
                headerTitle: "text-pine text-2xl",
                headerSubtitle: "text-ink/60",
                formButtonPrimary:
                  "bg-pine hover:bg-emerald text-sm normal-case rounded-xl py-3.5",
                formFieldInput:
                  "rounded-xl border-2 border-pine/25 bg-cream focus:border-emerald",
                footerActionLink: "text-emerald hover:text-pine",
              },
            }}
          />

          <div className="mt-8 space-y-1 rounded-xl border border-mint bg-cream px-4 py-3 text-left text-xs text-ink/50">
            <p className="font-semibold text-ink/60">Demo accounts</p>
            <p>Admin: admin@smartmedrecords.com / AdminPortal123!</p>
            <p>Reviewer: reviewer@smartmedrecords.com / ReviewerPortal123!</p>
            <p>Billing: billing@smartmedrecords.com / BillingPortal123!</p>
            <p>Client (Blake & Associates): client@smartmedrecords.com / ClientPortal123!</p>
            <p>Client (Harborview Legal): attorney@harborviewlegal.com / ClientPortal123!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
