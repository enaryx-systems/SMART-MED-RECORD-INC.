"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { ClerkProvider, useClerk } from "@clerk/nextjs";
import { PortalSidebar } from "@/components/portal/sidebar";
import { PortalHeader } from "@/components/portal/header";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import type { Role } from "@/lib/types/portal";

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
// Semantic search covers case document content — same RBAC boundary as case
// documents themselves (CLAUDE.md: BILLING never sees case content).
const NON_BILLING_SHARED_PATHS = ["/portal/search"];

function isAllowed(role: Role, pathname: string) {
  if (SHARED_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (NON_BILLING_SHARED_PATHS.some((p) => pathname.startsWith(p))) return role !== "BILLING";
  if (role === "CLIENT") {
    return !OTHER_PREFIXES.some((p) => pathname.startsWith(p));
  }
  // ADMIN carries REVIEWER and BILLING permissions server-side already (see
  // cases.service.ts scopeFor and invoices.service.ts orgWhere), so it also
  // gets the run of their portal routes here rather than being fenced to
  // /portal/admin only.
  if (role === "ADMIN") {
    return pathname.startsWith(ROLE_PREFIX.ADMIN) || pathname.startsWith(ROLE_PREFIX.REVIEWER) || pathname.startsWith(ROLE_PREFIX.BILLING);
  }
  return pathname.startsWith(ROLE_PREFIX[role]);
}

// Clerk's default copy names the app after the Clerk application itself
// ("Sign in to ENARYX") — overridden here so it reads "Portal" regardless of
// what the Clerk dashboard project is named.
const CLERK_LOCALIZATION = {
  signIn: {
    start: {
      title: "Sign in to Portal",
      subtitle: "Welcome back! Please sign in to continue",
    },
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={CLERK_LOCALIZATION}>
      <PortalLayoutInner>{children}</PortalLayoutInner>
    </ClerkProvider>
  );
}

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  useEffect(() => {
    if (pathname === "/portal/login" || pathname === "/portal") return;
    if (isLoading) return;
    if (!isSignedIn || !user) {
      router.replace("/portal/login");
      return;
    }
    if (!isAllowed(user.role, pathname)) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [pathname, isLoading, isSignedIn, user, router]);

  if (pathname === "/portal/login" || pathname === "/portal") {
    return <div className={`portal-shell ${poppins.variable}`}>{children}</div>;
  }

  if (isLoading || !user || !isAllowed(user.role, pathname)) {
    return (
      <div
        className={`portal-shell flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,#f1e5c6_0%,#d9ede1_45%,#b9dac7_100%)] text-ink/50 ${poppins.variable}`}
      >
        Loading…
      </div>
    );
  }

  function onLogout() {
    signOut(() => router.replace("/portal/login"));
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
        <main className="no-scrollbar flex-1 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
