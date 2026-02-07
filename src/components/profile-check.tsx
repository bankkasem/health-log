"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Component to check if user has completed their profile
 * Redirects to /profile if demographic data is missing
 */
export function ProfileCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check if not authenticated or already on profile/auth pages
    if (
      status === "loading" ||
      status === "unauthenticated" ||
      pathname === "/profile" ||
      pathname?.startsWith("/auth/")
    ) {
      setIsChecking(false);
      return;
    }

    // Check if profile is complete
    if (status === "authenticated" && session?.user) {
      const { gender, dateOfBirth, height } = session.user;

      // If any required demographic field is missing, redirect to profile
      if (!gender || !dateOfBirth || !height) {
        router.push("/profile");
        return;
      }
    }

    setIsChecking(false);
  }, [status, session, router, pathname]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-slate-600">กำลังตรวจสอบข้อมูล...</div>
      </div>
    );
  }

  return <>{children}</>;
}
