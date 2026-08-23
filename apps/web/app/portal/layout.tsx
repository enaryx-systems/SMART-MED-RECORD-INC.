"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { PortalSidebar } from "@/components/portal/sidebar";
import { PortalHeader } from "@/components/portal/header";
import { clearSession, getSession } from "@/lib/auth/session";
import type { AuthUser, Role } from "@/lib/types/portal";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-portal-heading",
});

const ROLE_HOME: Record<Role, string> = {
  CLIENT: "/portal/dashboard",
  ADMIN: "/portal/admin/dashboard",
  REVIEWER: "/portal/reviewer/dashboard",
  BILLING: "/portal/finance/dashboard",
};

const ROLE_PREFIX: Record<Role, string> = {
  CLIENT: "/portal", // CLIENT owns everything not claimed below
  ADMIN: "/portal/admin",
  REVIEWER: "/portal/reviewer",
  BILLING: "/portal/finance",
};

const OTHER_PREFIXES = ["/portal/admin", "/portal/reviewer", "/portal/finance"];
const SHARED_PATHS = ["/portal/support"];

function isAllowed(role: Role, pathname: string) {
  if (SHARED_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (role === "CLIENT") {
    return !OTHER_PREFIXES.some((p) => pathname.startsWith(p));
  }
  return pathname.startsWith(ROLE_PREFIX[role]);
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/portal/login") {
      setChecked(true);
      return;
    }
    const session = getSession();
    if (!session) {
      router.replace("/portal/login");
      return;
    }
    if (!isAllowed(session.user.role, pathname)) {
      router.replace(ROLE_HOME[session.user.role]);
      return;
    }
    setUser(session.user);
    setChecked(true);
  }, [pathname, router]);

  if (pathname === "/portal/login") {
    return <div className={`portal-shell ${poppins.variable}`}>{children}</div>;
  }

  if (!checked || !user) {
    return (
      <div
        className={`portal-shell flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,#f1e5c6_0%,#d9ede1_45%,#b9dac7_100%)] text-ink/50 ${poppins.variable}`}
      >
        Loading…
      </div>
    );
  }

  function onLogout() {
    clearSession();
    router.replace("/portal/login");
  }

  return (
    <div
      className={`portal-shell flex h-screen flex-col overflow-hidden bg-[linear-gradient(145deg,#f1e5c6_0%,#d9ede1_45%,#b9dac7_100%)] ${poppins.variable}`}
    >
      <PortalHeader user={user} onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <PortalSidebar role={user.role} />
        </Suspense>
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
