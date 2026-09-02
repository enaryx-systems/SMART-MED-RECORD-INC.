"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";

// Hidden on deploys where the portal is turned off (see next.config.ts).
const portalEnabled = process.env.NEXT_PUBLIC_PORTAL_ENABLED === "true";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services", dropdown: true },
  { label: "How it works", href: "/#process" },
  { label: "About us", href: "/about" },
  { label: "Resources", href: "/features", dropdown: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

function labelForPath(pathname: string) {
  if (pathname === "/features") return "Resources";
  if (pathname === "/pricing") return "Pricing";
  if (pathname === "/contact") return "Contact";
  if (pathname === "/about") return "About us";
  if (pathname === "/") return "Home";
  return "";
}

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => labelForPath(pathname));

  useEffect(() => {
    setSelected(labelForPath(pathname));
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pine/10 bg-ivory/92 backdrop-blur-xl">
      <div className="flex h-[68px] w-full items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-5 lg:px-8 xl:px-12">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex xl:gap-2">
          {navigation.map((item) => {
            const active = selected === item.label;
            return (
              <Link
                href={item.href}
                key={item.label}
                onClick={() => setSelected(item.label)}
                className={`group relative flex items-center gap-1 px-3 py-2.5 transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${
                  active ? "font-semibold text-emerald" : "text-ink hover:text-emerald"
                }`}
              >
                {item.label}
                {item.dropdown && <ChevronDown size={14} strokeWidth={2} />}
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-3 right-3 h-0.5 origin-center scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100"
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 gap-3 lg:flex">
          {portalEnabled && (
            <Link
              href="/portal/login"
              className="rounded-lg border border-pine px-5 py-2.5 text-sm font-semibold text-pine transition-colors hover:bg-pine hover:text-white"
            >
              Log in
            </Link>
          )}
          <Link
            href="/contact"
            className="rounded-lg bg-pine px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pine/15 transition-colors hover:bg-emerald"
          >
            Get a free sample
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-pine transition-colors hover:bg-pine hover:text-white lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-pine/10 bg-ivory px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-2 text-sm font-medium">
            {navigation.map((item) => {
              const active = selected === item.label;
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  onClick={() => {
                    setSelected(item.label);
                    setOpen(false);
                  }}
                  className={`group relative flex items-center justify-between px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] ${
                    active ? "font-semibold text-emerald" : "text-ink hover:text-emerald"
                  }`}
                >
                  {item.label}
                  {item.dropdown && <ChevronDown size={15} />}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-4 right-4 h-0.5 origin-center scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100"
                  />
                </Link>
              );
            })}
            {portalEnabled && (
              <Link
                href="/portal/login"
                className="mt-2 rounded-lg bg-pine px-4 py-3 text-center text-white"
              >
                Client portal
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
