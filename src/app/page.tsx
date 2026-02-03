import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-8">
          <UserMenu />
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-8">Health Log</h1>
            <div className="flex flex-col gap-4">
              <Button href="/weight" variant="primary" size="lg">
                บันทึกข้อมูลสุขภาพ
              </Button>
              <Button href="/records" variant="success" size="lg">
                ดูประวัติการบันทึก
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
