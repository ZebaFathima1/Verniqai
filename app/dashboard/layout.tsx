"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCurrentSession } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/dashboard/login";
  const isPublicRoute = isLoginRoute || pathname === "/dashboard/onboarding";

  useEffect(() => {
    const session = getCurrentSession();

    if (session && isLoginRoute) {
      router.replace("/dashboard");
      return;
    }

    if (!session && !isPublicRoute) {
      router.replace("/dashboard/login");
    }
  }, [isLoginRoute, isPublicRoute, pathname, router]);

  return <>{children}</>;
}
