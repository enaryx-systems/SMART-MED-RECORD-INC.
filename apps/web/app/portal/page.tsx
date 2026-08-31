"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import type { Role } from "@/lib/types/portal";

const ROLE_HOME: Record<Role, string> = {
  CLIENT: "/portal/dashboard",
  ADMIN: "/portal/admin/dashboard",
  REVIEWER: "/portal/reviewer/dashboard",
  BILLING: "/portal/finance/dashboard",
};

export default function PortalIndexPage() {
  const router = useRouter();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    if (!isSignedIn || !user) {
      router.replace("/portal/login");
      return;
    }
    router.replace(ROLE_HOME[user.role]);
  }, [isLoading, isSignedIn, user, router]);

  return null;
}
