"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";

const PUBLIC_ROUTES = ["/login", "/signup"];

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
    

    setLoading(false);
  }, [pathname]);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return <>{children}</>;
}