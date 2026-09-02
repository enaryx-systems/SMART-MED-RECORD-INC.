import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

// Hidden on deploys where the portal is turned off (see next.config.ts).
const portalEnabled = process.env.NEXT_PUBLIC_PORTAL_ENABLED === "true";

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: Linkedin },
  { label: "Facebook", href: "https://www.facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com", Icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com", Icon: Youtube },
];

export function PublicFooter() {
  return (
    <footer className="bg-[#032f29] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo portal />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
            AI-assisted, physician-reviewed medical record intelligence for legal teams that need
            answers they can trust.
          </p>
          <p className="mt-6 text-xs text-white/45">Smart records. Stronger outcomes.</p>
          <div className="mt-5 flex items-center gap-2.5">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Smart Med Records on ${label}`}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/65 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/15 hover:text-gold"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Platform</h4>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <Link href="/features">Features</Link>
            {portalEnabled && <Link href="/portal/login">Client portal</Link>}
            <a href="#security">Security</a>
            <a href="#services">Services</a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Company</h4>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <span>support@smartmedrecords.com</span>
            <span>+1 (800) 555-0164</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/45">
        © 2026 Smart Med Records. All rights reserved. HIPAA-aligned workflows · Secure & encrypted.
      </div>
    </footer>
  );
}
