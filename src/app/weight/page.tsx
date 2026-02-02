"use client";

import type { WeightFormData, WeightMetrics } from "@/types/weight";
import { useState } from "react";
import { UserMenu } from "@/components/user-menu";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WeightPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<WeightFormData>({
    bodyFatPercentage: "",
    muscleMass: "",
    visceralFat: "",
    bmr: "",
    bmi: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const entry: WeightMetrics = {
        timestamp: new Date().toISOString(),
        bodyFatPercentage: Number.parseFloat(formData.bodyFatPercentage),
        muscleMass: Number.parseFloat(formData.muscleMass),
        visceralFat: Number.parseFloat(formData.visceralFat),
        bmr: Number.parseFloat(formData.bmr),
        bmi: Number.parseFloat(formData.bmi),
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
          visceralFat: "",
          bmr: "",
          bmi: "",
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
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <UserMenu />
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">บันทึกข้อมูลสุขภาพ</h1>
        <Button href="/records" variant="primary" size="md">
          ดูประวัติ
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="เปอร์เซ็นต์ไขมันในร่างกาย (%)"
          type="number"
          step="0.1"
          id="bodyFatPercentage"
          name="bodyFatPercentage"
          value={formData.bodyFatPercentage}
          onChange={handleChange}
          required
        />

        <Input
          label="มวลกล้ามเนื้อ (kg)"
          type="number"
          step="0.1"
          id="muscleMass"
          name="muscleMass"
          value={formData.muscleMass}
          onChange={handleChange}
          required
        />

        <Input
          label="ไขมันในช่องท้อง"
          type="number"
          step="0.1"
          id="visceralFat"
          name="visceralFat"
          value={formData.visceralFat}
          onChange={handleChange}
          required
        />

        <Input
          label="อัตราการเผาผลาญพื้นฐาน (BMR)"
          type="number"
          step="1"
          id="bmr"
          name="bmr"
          value={formData.bmr}
          onChange={handleChange}
          required
        />

        <Input
          label="ดัชนีมวลกาย (BMI)"
          type="number"
          step="0.1"
          id="bmi"
          name="bmi"
          value={formData.bmi}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          variant="success"
          size="md"
          className="w-full"
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </Button>
      </form>
    </div>
  );
}
