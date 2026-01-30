import Link from "next/link";
import { UserMenu } from "@/components/user-menu";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-8">
          <UserMenu />
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">Health Log</h1>
            <div className="flex flex-col gap-4">
              <Link
                href="/weight"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                บันทึกข้อมูลสุขภาพ
              </Link>
              <Link
                href="/records"
                className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                ดูประวัติการบันทึก
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
