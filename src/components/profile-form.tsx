"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import type { User } from "@/types/auth";

interface ProfileFormProps {
  user?: User;
  onSuccess?: () => void;
}

export function ProfileForm({ user, onSuccess }: ProfileFormProps) {
  const { showToast } = useToast();
  const { update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    gender: user?.gender || "",
    dateOfBirth: user?.dateOfBirth || "",
    height: user?.height?.toString() || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validation
      const newErrors: Record<string, string> = {};

      if (!formData.gender) {
        newErrors.gender = "กรุณาเลือกเพศ";
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "กรุณากรอกวันเกิด";
      } else {
        const birthDate = new Date(formData.dateOfBirth);
        if (Number.isNaN(birthDate.getTime())) {
          newErrors.dateOfBirth = "วันเกิดไม่ถูกต้อง";
        } else if (birthDate > new Date()) {
          newErrors.dateOfBirth = "วันเกิดไม่สามารถเป็นวันในอนาคตได้";
        }
      }

      if (!formData.height) {
        newErrors.height = "กรุณากรอกส่วนสูง";
      } else {
        const height = Number(formData.height);
        if (Number.isNaN(height) || height <= 0 || height > 300) {
          newErrors.height = "ส่วนสูงต้องอยู่ระหว่าง 1-300 ซม.";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name || undefined,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          height: Number(formData.height),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ไม่สามารถอัปเดตโปรไฟล์ได้");
      }

      // Update session with fresh data
      await update();

      showToast(data.message || "บันทึกข้อมูลสำเร็จ", "success");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showToast(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="ชื่อ"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="ชื่อของคุณ"
      />

      <div className="w-full">
        <label
          htmlFor="gender"
          className="block text-sm font-semibold mb-2 text-slate-700"
        >
          เพศ
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        </label>
        <select
          id="gender"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ease-out
            ${
              errors.gender
                ? "border-red-400 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-slate-200 bg-white/60 backdrop-blur-sm text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            }
            focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
          required
          aria-invalid={errors.gender ? "true" : "false"}
        >
          <option value="">เลือกเพศ</option>
          <option value="male">ชาย</option>
          <option value="female">หญิง</option>
          <option value="other">อื่นๆ</option>
        </select>
        {errors.gender && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errors.gender}
          </p>
        )}
      </div>

      <Input
        label="วันเกิด"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) =>
          setFormData({ ...formData, dateOfBirth: e.target.value })
        }
        error={errors.dateOfBirth}
        required
        max={new Date().toISOString().split("T")[0]}
      />

      <Input
        label="ส่วนสูง (ซม.)"
        type="number"
        value={formData.height}
        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
        placeholder="170"
        error={errors.height}
        required
        min="1"
        max="300"
        step="0.1"
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
      </Button>
    </form>
  );
}
