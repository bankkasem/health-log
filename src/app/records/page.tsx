"use client";

import type { WeightMetrics } from "@/types/weight";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditRecordModal } from "@/components/edit-record-modal";
import { formatDateTime } from "@/utils/date";

type RecordData = WeightMetrics;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Pencil Icon
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path
        fillRule="evenodd"
        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Trash Icon
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Skeleton Row Component
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16" />
      </td>
    </tr>
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <UserMenu />
        </div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">ประวัติการบันทึก</h1>
          <Button href="/weight" variant="primary" size="md">
            บันทึกข้อมูลใหม่
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่/เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ไขมัน (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      กล้ามเนื้อ (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ไขมันช่องท้อง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows don't have unique ids
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">ยังไม่มีข้อมูล</p>
            <Button href="/weight" variant="ghost">
              เริ่มบันทึกข้อมูลแรก
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่/เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ไขมัน (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      กล้ามเนื้อ (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ไขมันช่องท้อง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMI
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 1 ? "bg-gray-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(record.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.bodyFatPercentage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.muscleMass}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.visceralFat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.bmr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.bmi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditClick(record)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={`แก้ไขข้อมูลวันที่ ${new Date(record.timestamp).toLocaleDateString("th-TH")}`}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(record)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            aria-label={`ลบข้อมูลวันที่ ${new Date(record.timestamp).toLocaleDateString("th-TH")}`}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                แสดง{" "}
                {records.length > 0
                  ? (pagination.page - 1) * pagination.limit + 1
                  : 0}
                -
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                จาก {pagination.total} รายการ
              </div>
              {pagination.totalPages > 1 && (
                <nav className="flex gap-2" aria-label="การนำทางหน้า">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    aria-label="หน้าก่อนหน้า"
                    className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex gap-1">
                            {showEllipsis && (
                              <span
                                className="px-3 py-2 text-sm text-gray-500"
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
                                pagination.page === page ? "page" : undefined
                              }
                              className={`min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                                pagination.page === page
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
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
                    className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ถัดไป
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deletingRecord !== null}
        title="ยืนยันการลบข้อมูล"
        message={
          deletingRecord ? (
            <>
              คุณต้องการลบข้อมูลวันที่{" "}
              <strong>{formatDateTime(deletingRecord.timestamp)}</strong> หรือไม่?
              การดำเนินการนี้ไม่สามารถยกเลิกได้
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
  );
}
