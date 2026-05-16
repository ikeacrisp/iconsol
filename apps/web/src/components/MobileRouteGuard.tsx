"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const MOBILE_QUERY = "(max-width: 640px)";

export function MobileRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/" || typeof window === "undefined") return;

    const media = window.matchMedia(MOBILE_QUERY);
    if (!media.matches) return;

    router.replace("/");
  }, [pathname, router]);

  return null;
}
