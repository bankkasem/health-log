"use client";

import { useSession, signOut } from "next-auth/react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      // biome-ignore lint/a11y/useSemanticElements: Loading indicator needs role="status" for screen readers
      <div className="text-sm text-gray-600" role="status" aria-live="polite">
        กำลังโหลด...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex gap-2 md:gap-4">
        <Button href="/auth/signin" variant="ghost" size="sm">
          เข้าสู่ระบบ
        </Button>
        <Button href="/auth/signup" variant="ghost" size="sm">
          สมัครสมาชิก
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <span className="text-sm text-gray-700 truncate max-w-[150px] md:max-w-none">
        {session.user?.email}
      </span>
      <Link
        href="/profile"
        className="flex items-center justify-center h-9 w-9 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="โปรไฟล์"
        title="โปรไฟล์"
      >
        <FiUser className="h-5 w-5" />
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center justify-center h-9 w-9 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="ออกจากระบบ"
        title="ออกจากระบบ"
      >
        <FiLogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
