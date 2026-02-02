"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

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
      <Button
        onClick={() => signOut({ callbackUrl: "/" })}
        variant="danger"
        size="sm"
        aria-label="ออกจากระบบ"
      >
        ออกจากระบบ
      </Button>
    </div>
  );
}
