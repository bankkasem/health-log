"use client";

import { useEffect, useRef, useState } from "react";
import type { WeightMetrics } from "@/types/weight";
import { formatDateTime } from "@/utils/date";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface EditRecordModalProps {
  isOpen: boolean;
  record: WeightMetrics | null;
  isLoading?: boolean;
  onSave: (data: Partial<WeightMetrics>) => void;
  onCancel: () => void;
}

interface FormState {
  bodyFatPercentage: string;
  muscleMass: string;
  visceralFat: string;
  bmr: string;
  bmi: string;
}

export function EditRecordModal({
  isOpen,
  record,
  isLoading = false,
  onSave,
  onCancel,
}: EditRecordModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [formData, setFormData] = useState<FormState>({
    bodyFatPercentage: "",
    muscleMass: "",
    visceralFat: "",
    bmr: "",
    bmi: "",
  });

  // Reset form when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        bodyFatPercentage: record.bodyFatPercentage.toString(),
        muscleMass: record.muscleMass.toString(),
        visceralFat: record.visceralFat.toString(),
        bmr: record.bmr.toString(),
        bmi: record.bmi.toString(),
      });
    }
  }, [record]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }

      // Focus trap
      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    onSave({
      id: record.id,
      bodyFatPercentage: Number.parseFloat(formData.bodyFatPercentage),
      muscleMass: Number.parseFloat(formData.muscleMass),
      visceralFat: Number.parseFloat(formData.visceralFat),
      bmr: Number.parseFloat(formData.bmr),
      bmi: Number.parseFloat(formData.bmi),
    });
  };

  if (!isOpen || !record) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={!isLoading ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 focus:outline-none max-h-[90vh] overflow-y-auto"
      >
        <h2
          id="edit-dialog-title"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          แก้ไขข้อมูล
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          วันที่: {formatDateTime(record.timestamp)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="เปอร์เซ็นต์ไขมัน"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.bodyFatPercentage}
            onChange={(e) => handleChange("bodyFatPercentage", e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="มวลกล้ามเนื้อ (kg)"
            type="number"
            step="0.1"
            min="0"
            value={formData.muscleMass}
            onChange={(e) => handleChange("muscleMass", e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="ไขมันในช่องท้อง"
            type="number"
            step="0.1"
            min="0"
            value={formData.visceralFat}
            onChange={(e) => handleChange("visceralFat", e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="BMR (Basal Metabolic Rate)"
            type="number"
            step="1"
            min="0"
            value={formData.bmr}
            onChange={(e) => handleChange("bmr", e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="BMI (Body Mass Index)"
            type="number"
            step="0.1"
            min="0"
            value={formData.bmi}
            onChange={(e) => handleChange("bmi", e.target.value)}
            required
            disabled={isLoading}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onCancel}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={isLoading}
            >
              บันทึก
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
