"use client";

import type { WeightMetrics } from "@/types/weight";
import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiClipboard,
  FiPlus,
  FiDroplet,
  FiActivity,
  FiBarChart2,
  FiZap,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";
import { UserMenu } from "@/components/user-menu";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditRecordModal } from "@/components/edit-record-modal";
import { formatDateTime } from "@/utils/date";
import { ProfileCheck } from "@/components/profile-check";

type RecordData = WeightMetrics;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Skeleton Row Component
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-lg w-32" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-lg w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-lg w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-lg w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-lg w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-lg w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded-lg w-16" />
      </td>
    </tr>
  );
}

// Stats Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "blue" | "green" | "orange" | "purple" | "red";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    green: "from-emerald-500 to-green-600 shadow-green-500/30",
    orange: "from-orange-500 to-amber-600 shadow-orange-500/30",
    purple: "from-violet-500 to-purple-600 shadow-violet-500/30",
    red: "from-red-500 to-rose-600 shadow-red-500/30",
  };

  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">
            {label}
          </p>
          <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function RecordsPage() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<RecordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Edit/Delete state
  const [editingRecord, setEditingRecord] = useState<WeightMetrics | null>(
    null,
  );
  const [deletingRecord, setDeletingRecord] = useState<WeightMetrics | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchRecords should run when pagination.page changes
  useEffect(() => {
    fetchRecords();
  }, [pagination.page]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/weight?page=${pagination.page}&limit=${pagination.limit}`,
      );
      const result = await response.json();

      if (result.success) {
        setRecords(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Delete handlers
  const handleDeleteClick = (record: WeightMetrics) => {
    setDeletingRecord(record);
  };

  const handleDeleteCancel = () => {
    setDeletingRecord(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/weight?id=${deletingRecord.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.status === 401) {
        window.location.href = "/api/auth/signin";
        return;
      }

      if (result.success) {
        showToast("ลบข้อมูลเรียบร้อยแล้ว", "success");
        setDeletingRecord(null);
        fetchRecords();
      } else {
        showToast(result.message || "เกิดข้อผิดพลาดในการลบข้อมูล", "error");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      showToast("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit handlers
  const handleEditClick = (record: WeightMetrics) => {
    setEditingRecord(record);
  };

  const handleEditCancel = () => {
    setEditingRecord(null);
  };

  const handleEditSave = async (data: Partial<WeightMetrics>) => {
    if (!editingRecord) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/weight", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 401) {
        window.location.href = "/api/auth/signin";
        return;
      }

      if (result.success) {
        showToast("แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
        setEditingRecord(null);
        fetchRecords();
      } else {
        showToast(result.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล", "error");
      }
    } catch (error) {
      console.error("Error updating record:", error);
      showToast("เกิดข้อผิดพลาดในการแก้ไขข้อมูล", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate stats from the latest record
  const latestRecord = records[0];

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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <FiClipboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    ประวัติการบันทึก
                  </h1>
                  <p className="text-slate-600 text-sm">
                    {pagination.total > 0
                      ? `ทั้งหมด ${pagination.total} รายการ`
                      : "ยังไม่มีข้อมูล"}
                  </p>
                </div>
              </div>
              <Button href="/weight" variant="primary" size="md">
                <FiPlus className="w-5 h-5" />
                บันทึกข้อมูลใหม่
              </Button>
            </div>

            {/* Stats Cards - Show latest values */}
            {!isLoading && latestRecord && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <StatCard
                  icon={<FiCalendar className="w-5 h-5 text-white" />}
                  label="ล่าสุด"
                  value={new Date(latestRecord.timestamp).toLocaleDateString(
                    "th-TH",
                    { day: "numeric", month: "short" },
                  )}
                  color="purple"
                />
                <StatCard
                  icon={<FiDroplet className="w-5 h-5 text-white" />}
                  label="ไขมัน (%)"
                  value={latestRecord.bodyFatPercentage}
                  color="blue"
                />
                <StatCard
                  icon={<FiActivity className="w-5 h-5 text-white" />}
                  label="กล้ามเนื้อ (kg)"
                  value={latestRecord.muscleMass}
                  color="green"
                />
                <StatCard
                  icon={<FiZap className="w-5 h-5 text-white" />}
                  label="BMR"
                  value={latestRecord.bmr}
                  color="orange"
                />
                <StatCard
                  icon={<FiTrendingUp className="w-5 h-5 text-white" />}
                  label="BMI"
                  value={latestRecord.bmi}
                  color="red"
                />
              </div>
            )}

            {/* Table Container */}
            {isLoading ? (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          วันที่/เวลา
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          ไขมัน (%)
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          กล้ามเนื้อ (kg)
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          ไขมันช่องท้อง
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          BMR
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          BMI
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...Array(5)].map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows don't have unique ids
                        <SkeletonRow key={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : records.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                  <FiClipboard className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  ยังไม่มีข้อมูล
                </h3>
                <p className="text-slate-600 mb-6">เริ่มบันทึกข้อมูลสุขภาพของคุณวันนี้</p>
                <Button href="/weight" variant="primary">
                  <FiPlus className="w-5 h-5" />
                  บันทึกข้อมูลแรก
                </Button>
              </div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          วันที่/เวลา
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          ไขมัน (%)
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          กล้ามเนื้อ (kg)
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          ไขมันช่องท้อง
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          BMR
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          BMI
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((record, index) => (
                        <tr
                          key={record.id}
                          className={`transition-colors duration-200 hover:bg-blue-50/50 ${
                            index % 2 === 1 ? "bg-slate-50/30" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {formatDateTime(record.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                              <FiDroplet className="w-4 h-4 text-blue-500" />
                              {record.bodyFatPercentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                              <FiActivity className="w-4 h-4 text-emerald-500" />
                              {record.muscleMass}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                              <FiBarChart2 className="w-4 h-4 text-orange-500" />
                              {record.visceralFat}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                              <FiZap className="w-4 h-4 text-amber-500" />
                              {record.bmr}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                              <FiTrendingUp className="w-4 h-4 text-violet-500" />
                              {record.bmi}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditClick(record)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label={`แก้ไขข้อมูลวันที่ ${new Date(record.timestamp).toLocaleDateString("th-TH")}`}
                              >
                                <FiEdit2 className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(record)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                aria-label={`ลบข้อมูลวันที่ ${new Date(record.timestamp).toLocaleDateString("th-TH")}`}
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      แสดง{" "}
                      {records.length > 0
                        ? (pagination.page - 1) * pagination.limit + 1
                        : 0}
                      -
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )}{" "}
                      จาก {pagination.total} รายการ
                    </div>
                    <nav className="flex gap-2" aria-label="การนำทางหน้า">
                      <button
                        type="button"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        aria-label="หน้าก่อนหน้า"
                        className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        ก่อนหน้า
                      </button>
                      <div className="flex gap-1">
                        {Array.from(
                          { length: pagination.totalPages },
                          (_, i) => i + 1,
                        )
                          .filter((page) => {
                            // Show first page, last page, current page, and pages around current
                            return (
                              page === 1 ||
                              page === pagination.totalPages ||
                              Math.abs(page - pagination.page) <= 1
                            );
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            const prevPage = array[index - 1];
                            const showEllipsis =
                              prevPage && page - prevPage > 1;

                            return (
                              <div key={page} className="flex gap-1">
                                {showEllipsis && (
                                  <span
                                    className="px-3 py-2 text-sm text-slate-500"
                                    aria-hidden="true"
                                  >
                                    ...
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handlePageChange(page)}
                                  aria-label={`หน้า ${page}`}
                                  aria-current={
                                    pagination.page === page
                                      ? "page"
                                      : undefined
                                  }
                                  className={`min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${
                                    pagination.page === page
                                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                                      : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        aria-label="หน้าถัดไป"
                        className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        ถัดไป
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={deletingRecord !== null}
          title="ยืนยันการลบข้อมูล"
          message={
            deletingRecord ? (
              <>
                คุณต้องการลบข้อมูลวันที่{" "}
                <strong>{formatDateTime(deletingRecord.timestamp)}</strong>{" "}
                หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
              </>
            ) : (
              ""
            )
          }
          confirmLabel="ลบ"
          cancelLabel="ยกเลิก"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        {/* Edit Record Modal */}
        <EditRecordModal
          isOpen={editingRecord !== null}
          record={editingRecord}
          isLoading={isUpdating}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      </div>
    </ProfileCheck>
  );
}
