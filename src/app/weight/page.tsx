"use client";

import { useState } from "react";
import Link from "next/link";
import type { WeightFormData, WeightMetrics } from "@/types/weight";

export default function WeightPage() {
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
        timestamp: new Date().toLocaleString("th-TH"),
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
        alert(result.message);
        setFormData({
          bodyFatPercentage: "",
          muscleMass: "",
          visceralFat: "",
          bmr: "",
          bmi: "",
        });
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error("Error saving to file:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกไฟล์");
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
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">บันทึกข้อมูลสุขภาพ</h1>
        <Link
          href="/records"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          ดูประวัติ
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="bodyFatPercentage"
            className="block text-sm font-medium mb-2"
          >
            เปอร์เซ็นต์ไขมันในร่างกาย (%)
          </label>
          <input
            type="number"
            step="0.1"
            id="bodyFatPercentage"
            name="bodyFatPercentage"
            value={formData.bodyFatPercentage}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="muscleMass"
            className="block text-sm font-medium mb-2"
          >
            มวลกล้ามเนื้อ (kg)
          </label>
          <input
            type="number"
            step="0.1"
            id="muscleMass"
            name="muscleMass"
            value={formData.muscleMass}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="visceralFat"
            className="block text-sm font-medium mb-2"
          >
            ไขมันในช่องท้อง
          </label>
          <input
            type="number"
            step="0.1"
            id="visceralFat"
            name="visceralFat"
            value={formData.visceralFat}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="bmr" className="block text-sm font-medium mb-2">
            อัตราการเผาผลาญพื้นฐาน (BMR)
          </label>
          <input
            type="number"
            step="1"
            id="bmr"
            name="bmr"
            value={formData.bmr}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="bmi" className="block text-sm font-medium mb-2">
            ดัชนีมวลกาย (BMI)
          </label>
          <input
            type="number"
            step="0.1"
            id="bmi"
            name="bmi"
            value={formData.bmi}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึกลงไฟล์"}
        </button>
      </form>
    </div>
  );
}
