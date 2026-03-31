"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // ✅ skip login page
    if (pathname === "/login") {
      setIsReady(true);
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
      window.location.href = "/login";
    } else {
      setIsReady(true);
    }
  }, [pathname]);

  if (!isReady) return null;

  return <>{children}</>;
}