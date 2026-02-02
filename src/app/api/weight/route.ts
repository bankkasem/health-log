import type { WeightMetrics, DatabaseWeightMetric } from "@/types/weight";
import { toWeightMetrics } from "@/types/weight";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("weight_metrics")
      .select("*")
      .eq("user_id", session.user.id)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching weight metrics:", error);
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการอ่านข้อมูล" },
        { status: 500 },
      );
    }

    const metrics = (data as DatabaseWeightMetric[]).map(toWeightMetrics);

    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error("Error reading weight metrics:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอ่านข้อมูล" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const entry: WeightMetrics = body;

    console.log(
      "Attempting to insert weight metric for user:",
      session.user.id,
    );

    const { error } = await supabaseAdmin.from("weight_metrics").insert({
      user_id: session.user.id,
      timestamp: entry.timestamp,
      body_fat_percentage: entry.bodyFatPercentage,
      muscle_mass: entry.muscleMass,
      visceral_fat: entry.visceralFat,
      bmr: entry.bmr,
      bmi: entry.bmi,
    });

    if (error) {
      console.error("Error saving weight metric:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error saving weight metric:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 },
    );
  }
}
