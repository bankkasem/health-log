"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชียังไม่ได้ยืนยันอีเมล");
        } else {
          setError(`เกิดข้อผิดพลาด: ${result.error}`);
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
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
            เข้าสู่ระบบ
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
            autoComplete="current-password"
          />

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="md"
            className="w-full"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">ยังไม่มีบัญชี? </span>
          <Button href="/auth/signup" variant="ghost" size="sm">
            สมัครสมาชิก
          </Button>
        </div>
      </div>
    </div>
  );
}
