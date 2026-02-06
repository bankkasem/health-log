"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiUserPlus, FiUser, FiMail, FiLock, FiHeart } from "react-icons/fi";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        return;
      }

      router.push("/auth/signin?registered=true");
    } catch (_error) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-violet-400/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-green-500/30 mb-4">
            <FiHeart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Health Log</h1>
          <p className="text-slate-600">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
        </div>

        {/* Sign Up Card */}
        <div className="glass p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
            สมัครสมาชิก
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                role="alert"
                aria-live="polite"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-label="ข้อผิดพลาด"
                >
                  <title>ข้อผิดพลาด</title>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <Input
              label="ชื่อ"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              icon={<FiUser className="w-5 h-5" />}
              placeholder="ชื่อของคุณ"
            />

            <Input
              label="อีเมล"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              icon={<FiMail className="w-5 h-5" />}
              placeholder="your@email.com"
            />

            <Input
              label="รหัสผ่าน"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              icon={<FiLock className="w-5 h-5" />}
              placeholder="••••••••"
              helperText="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
            />

            <Input
              label="ยืนยันรหัสผ่าน"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              icon={<FiLock className="w-5 h-5" />}
              placeholder="••••••••"
              error={
                confirmPassword && password !== confirmPassword
                  ? "รหัสผ่านไม่ตรงกัน"
                  : undefined
              }
            />

            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              variant="success"
              size="lg"
              className="w-full"
            >
              <FiUserPlus className="w-5 h-5" />
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <span className="text-slate-600">มีบัญชีอยู่แล้ว? </span>
            <Button href="/auth/signin" variant="ghost" size="sm">
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
