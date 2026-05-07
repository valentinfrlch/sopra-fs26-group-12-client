"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PUBLIC_ROUTES } from "@/utils/routes";
import { getApiDomain } from "@/utils/domain";
import { clearUserSession } from "@/utils/auth";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const isPublic = PUBLIC_ROUTES.includes(pathname);

      if (isPublic && (!token || !userId)) {
        setLoading(false);
        return;
      }

      if (!token || !userId) {
        clearUserSession();
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const response = await fetch(`${getApiDomain()}/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearUserSession();

          if (isPublic) {
            setLoading(false);
          } else {
            router.push("/login");
          }

          return;
        }

        if (isPublic && pathname !== "/") {
          router.push("/cookbook");
          return;
        }

        setLoading(false);
      } catch {
        clearUserSession();

        if (isPublic) {
          setLoading(false);
        } else {
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return <>{children}</>;
}