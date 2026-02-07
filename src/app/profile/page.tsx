"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import type { User } from "@/types/auth";

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status, router, fetchUserProfile]);

  const handleSuccess = () => {
    // Refresh user data
    fetchUserProfile();
    // Optionally redirect to home
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-slate-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                โปรไฟล์ของคุณ
              </h1>
            </Link>
            <p className="text-slate-600">
              กรุณากรอกข้อมูลส่วนตัวเพื่อใช้ในการคำนวณค่าต่างๆ
            </p>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">อีเมล:</span> {user.email}
              </p>
            </div>
          )}

          <ProfileForm user={user || undefined} onSuccess={handleSuccess} />

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              ← กลับ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
