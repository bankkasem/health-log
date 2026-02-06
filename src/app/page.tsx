import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { FiActivity, FiClipboard, FiHeart, FiTrendingUp } from "react-icons/fi";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-end mb-8">
            <UserMenu />
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-medium mb-6">
              <FiHeart className="w-4 h-4" />
              ดูแลสุขภาพของคุณ
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Health Log
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              บันทึกและติดตามข้อมูลสุขภาพของคุณ เพื่อการดูแลตัวเองที่ดีขึ้น
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Record Health Card */}
            <div className="group glass card-hover p-8 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <FiActivity className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                บันทึกข้อมูลสุขภาพ
              </h2>
              <p className="text-slate-600 mb-6">
                บันทึกข้อมูลไขมันในร่างกาย มวลกล้ามเนื้อ BMR และ BMI ของคุณ
              </p>
              <Button
                href="/weight"
                variant="primary"
                size="lg"
                className="w-full"
              >
                <FiTrendingUp className="w-5 h-5" />
                บันทึกข้อมูล
              </Button>
            </div>

            {/* View History Card */}
            <div className="group glass card-hover p-8 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                <FiClipboard className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                ดูประวัติการบันทึก
              </h2>
              <p className="text-slate-600 mb-6">
                ตรวจสอบและติดตามความก้าวหน้าของคุณผ่านประวัติการบันทึก
              </p>
              <Button
                href="/records"
                variant="success"
                size="lg"
                className="w-full"
              >
                <FiClipboard className="w-5 h-5" />
                ดูประวัติ
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div
              className="animate-slide-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                ติดตามความก้าวหน้า
              </p>
            </div>
            <div
              className="animate-slide-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <FiActivity className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">วิเคราะห์ข้อมูล</p>
            </div>
            <div
              className="animate-slide-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                <FiHeart className="w-6 h-6 text-violet-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">ดูแลสุขภาพ</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
