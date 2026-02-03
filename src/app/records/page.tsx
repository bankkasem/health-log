"use client";

import type { WeightMetrics } from "@/types/weight";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";

type RecordData = WeightMetrics;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        {/* biome-ignore lint/a11y/useSemanticElements: Loading indicator needs role="status" for screen readers */}
        <div className="text-center" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
          <p className="text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

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

        {records.length === 0 ? (
          <div className="text-center py-12">
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.timestamp).toLocaleString("th-TH", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
    </div>
  );
}
