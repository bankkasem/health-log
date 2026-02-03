import type { WeightMetrics, DatabaseWeightMetric } from "@/types/weight";
import { toWeightMetrics } from "@/types/weight";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

interface UpdateWeightMetrics {
  id: string;
  bodyFatPercentage?: number;
  muscleMass?: number;
  visceralFat?: number;
  bmr?: number;
  bmi?: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from("weight_metrics")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    // Get paginated data
    const { data, error } = await supabaseAdmin
      .from("weight_metrics")
      .select("*")
      .eq("user_id", session.user.id)
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching weight metrics:", error);
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการอ่านข้อมูล" },
        { status: 500 },
      );
    }

    const metrics = (data as DatabaseWeightMetric[]).map(toWeightMetrics);

    return NextResponse.json({
      success: true,
      data: metrics,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ ID ของข้อมูลที่ต้องการลบ" },
        { status: 400 },
      );
    }

    // Verify ownership before deleting
    const { data: existing } = await supabaseAdmin
      .from("weight_metrics")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลที่ต้องการลบ" },
        { status: 404 },
      );
    }

    const { error } = await supabaseAdmin
      .from("weight_metrics")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting weight metric:", error);
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error deleting weight metric:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: UpdateWeightMetrics = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ ID ของข้อมูลที่ต้องการแก้ไข" },
        { status: 400 },
      );
    }

    // Verify ownership before updating
    const { data: existing } = await supabaseAdmin
      .from("weight_metrics")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลที่ต้องการแก้ไข" },
        { status: 404 },
      );
    }

    // Map camelCase to snake_case
    const dbUpdateFields: Record<string, number> = {};
    if (updateFields.bodyFatPercentage !== undefined) {
      dbUpdateFields.body_fat_percentage = updateFields.bodyFatPercentage;
    }
    if (updateFields.muscleMass !== undefined) {
      dbUpdateFields.muscle_mass = updateFields.muscleMass;
    }
    if (updateFields.visceralFat !== undefined) {
      dbUpdateFields.visceral_fat = updateFields.visceralFat;
    }
    if (updateFields.bmr !== undefined) {
      dbUpdateFields.bmr = updateFields.bmr;
    }
    if (updateFields.bmi !== undefined) {
      dbUpdateFields.bmi = updateFields.bmi;
    }

    const { data, error } = await supabaseAdmin
      .from("weight_metrics")
      .update(dbUpdateFields)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating weight metric:", error);
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อมูลเรียบร้อยแล้ว",
      data: toWeightMetrics(data as DatabaseWeightMetric),
    });
  } catch (error) {
    console.error("Error updating weight metric:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" },
      { status: 500 },
    );
  }
}
