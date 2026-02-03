"use client";

import { useSession, signOut } from "next-auth/react";

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

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
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center justify-center h-9 w-9 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="ออกจากระบบ"
        title="ออกจากระบบ"
      >
        <LogoutIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
