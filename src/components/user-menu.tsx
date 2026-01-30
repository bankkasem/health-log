"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm text-gray-500">กำลังโหลด...</div>;
  }

  if (!session) {
    return (
      <div className="flex gap-4">
        <Link
          href="/auth/signin"
          className="text-blue-600 hover:underline text-sm"
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          href="/auth/signup"
          className="text-blue-600 hover:underline text-sm"
        >
          สมัครสมาชิก
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">{session.user?.email}</span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-red-600 hover:underline"
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
