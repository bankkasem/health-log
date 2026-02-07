"use client";

import type { WeightFormData, WeightMetricsInput } from "@/types/weight";
import { useState } from "react";
import { UserMenu } from "@/components/user-menu";
import { useToast } from "@/components/toast";
import { ProfileCheck } from "@/components/profile-check";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  FiActivity,
  FiClipboard,
  FiDroplet,
  FiSave,
  FiArrowLeft,
  FiTrendingUp,
} from "react-icons/fi";

const formFields = [
  {
    name: "weight" as keyof WeightFormData,
    label: "น้ำหนัก (kg)",
    icon: <FiTrendingUp className="w-5 h-5" />,
    step: "0.1",
    description: "น้ำหนักร่างกายทั้งหมด",
  },
  {
    name: "bodyFatPercentage" as keyof WeightFormData,
    label: "เปอร์เซ็นต์ไขมันในร่างกาย (%)",
    icon: <FiDroplet className="w-5 h-5" />,
    step: "0.1",
    description: "เปอร์เซ็นต์ไขมันรวมในร่างกาย",
  },
  {
    name: "muscleMass" as keyof WeightFormData,
    label: "มวลกล้ามเนื้อ (kg)",
    icon: <FiActivity className="w-5 h-5" />,
    step: "0.1",
    description: "น้ำหนักของกล้ามเนื้อทั้งหมด",
  },
];

export default function WeightPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<WeightFormData>({
    bodyFatPercentage: "",
    muscleMass: "",
    weight: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const entry: WeightMetricsInput = {
        timestamp: new Date().toISOString(),
        bodyFatPercentage: Number.parseFloat(formData.bodyFatPercentage),
        muscleMass: Number.parseFloat(formData.muscleMass),
        weight: Number.parseFloat(formData.weight),
        bmr: 0, // Will be calculated by API
        bmi: 0, // Will be calculated by API
      };

      const response = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setFormData({
          bodyFatPercentage: "",
          muscleMass: "",
          weight: "",
        });
      } else {
        showToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ProfileCheck>
      <div className="min-h-screen relative">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-end mb-4">
              <UserMenu />
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FiActivity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    บันทึกข้อมูลสุขภาพ
                  </h1>
                  <p className="text-slate-600 text-sm">
                    บันทึกข้อมูลเพื่อติดตามความก้าวหน้า
                  </p>
                </div>
              </Link>
              <Button href="/records" variant="outline" size="md">
                <FiClipboard className="w-5 h-5" />
                ดูประวัติ
              </Button>
            </div>

            {/* Form Card */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6">
                  {formFields.map((field, index) => (
                    <div
                      key={field.name}
                      className="animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Input
                        label={field.label}
                        type="number"
                        step={field.step}
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        icon={field.icon}
                        placeholder="0.0"
                        helperText={field.description}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Button
                    href="/"
                    variant="secondary"
                    size="lg"
                    className="sm:flex-1"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                    กลับหน้าหลัก
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    variant="success"
                    size="lg"
                    className="sm:flex-[2]"
                  >
                    <FiSave className="w-5 h-5" />
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Tips Section */}
            <div className="mt-8 glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-blue-600" />
                เคล็ดลับการบันทึก
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  บันทึกข้อมูลในช่วงเวลาเดียวกันของแต่ละวันเพื่อความแม่นยำ
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  ใช้เครื่องชั่งเดิมเพื่อให้ผลลัพธ์สอดคล้องกัน
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  ตรวจสอบข้อมูลก่อนบันทึกเพื่อความถูกต้อง
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProfileCheck>
  );
}
