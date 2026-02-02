"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 p-6 md:p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            สมัครสมาชิก
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200"
              role="alert"
              aria-live="polite"
            >
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
          />

          <Input
            label="อีเมล"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
            variant="primary"
            size="md"
            className="w-full"
          >
            {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
          <Button href="/auth/signin" variant="ghost" size="sm">
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}
