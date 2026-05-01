"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";

import { PUBLIC_ROUTES } from "@/utils/routes";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuth = isAuthenticated();
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // Route Protection
    if (!isAuth && !isPublic) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    
    if (isAuth && isPublic) {
    router.push("/cookbook");
    return;
    }

    setLoading(false);
  }, [pathname]);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return <>{children}</>;
}