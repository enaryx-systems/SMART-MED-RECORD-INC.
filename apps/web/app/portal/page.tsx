"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import type { Role } from "@/lib/types/portal";

const ROLE_HOME: Record<Role, string> = {
  CLIENT: "/portal/dashboard",
  ADMIN: "/portal/admin/dashboard",
  REVIEWER: "/portal/reviewer/dashboard",
  BILLING: "/portal/finance/dashboard",
};

export default function PortalIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    router.replace(session ? ROLE_HOME[session.user.role] : "/portal/login");
  }, [router]);

  return null;
}
