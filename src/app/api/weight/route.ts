import type { WeightMetrics, DatabaseWeightMetric } from "@/types/weight";
import { toWeightMetrics } from "@/types/weight";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

interface UpdateWeightMetrics {
  id: string;
  timestamp?: string;
  bodyFatPercentage?: number;
  muscleMass?: number;
  visceralFat?: number;
  weight?: number;
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

    // Check for duplicate dates
    const entryDate = new Date(entry.timestamp).toISOString().split("T")[0];
    const { data: duplicateCheck, error: duplicateError } = await supabaseAdmin
      .from("weight_metrics")
      .select("id")
      .eq("user_id", session.user.id)
      .gte("timestamp", `${entryDate}T00:00:00`)
      .lte("timestamp", `${entryDate}T23:59:59`);

    if (duplicateError) {
      console.error("Error checking for duplicates:", duplicateError);
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูลซ้ำ" },
        { status: 500 },
      );
    }

    if (duplicateCheck && duplicateCheck.length > 0) {
      return NextResponse.json(
        { success: false, message: "มีข้อมูลอยู่แล้วในวันที่นี้ กรุณาเลือกวันอื่น" },
        { status: 409 },
      );
    }

    // Get user profile data for BMR/BMI calculations
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("gender, date_of_birth, height")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { success: false, message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" },
        { status: 500 },
      );
    }

    // Calculate BMI if height is available
    let bmi = 0;
    if (userData?.height && entry.weight > 0) {
      const heightInMeters = userData.height / 100;
      bmi = entry.weight / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 10) / 10;
    }

    // Calculate BMR if all required data is available
    let bmr = 0;
    if (
      userData?.height &&
      userData?.date_of_birth &&
      userData?.gender &&
      entry.weight > 0
    ) {
      const today = new Date();
      const birthDate = new Date(userData.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Mifflin-St Jeor Equation
      bmr = 10 * entry.weight + 6.25 * userData.height - 5 * age;

      if (userData.gender === "male") {
        bmr += 5;
      } else if (userData.gender === "female") {
        bmr -= 161;
      } else {
        // For "other", use average
        bmr -= 78;
      }

      bmr = Math.round(bmr);
    }

    console.log(
      "Attempting to insert weight metric for user:",
      session.user.id,
    );

    const insertData: Record<string, number | string> = {
      user_id: session.user.id,
      timestamp: entry.timestamp,
      body_fat_percentage: entry.bodyFatPercentage,
      muscle_mass: entry.muscleMass,
      weight: entry.weight,
      bmr: bmr,
      bmi: bmi,
    };

    // Only include visceralFat if provided
    if (entry.visceralFat !== undefined && entry.visceralFat !== null) {
      insertData.visceral_fat = entry.visceralFat;
    }

    const { error } = await supabaseAdmin
      .from("weight_metrics")
      .insert(insertData);

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
    const { id, timestamp, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ ID ของข้อมูลที่ต้องการแก้ไข" },
        { status: 400 },
      );
    }

    // Get the existing record
    const { data: existingRecord, error: existingError } = await supabaseAdmin
      .from("weight_metrics")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (existingError || !existingRecord) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลที่ต้องการแก้ไข" },
        { status: 404 },
      );
    }

    // Check for duplicate dates if timestamp is being changed
    if (timestamp) {
      const newDate = new Date(timestamp).toISOString().split("T")[0];
      const currentDate = new Date(existingRecord.timestamp)
        .toISOString()
        .split("T")[0];

      if (newDate !== currentDate) {
        // Check if another record exists on the same date
        const { data: duplicateCheck, error: duplicateError } =
          await supabaseAdmin
            .from("weight_metrics")
            .select("id")
            .eq("user_id", session.user.id)
            .neq("id", id) // Exclude current record
            .gte("timestamp", `${newDate}T00:00:00`)
            .lte("timestamp", `${newDate}T23:59:59`);

        if (duplicateError) {
          console.error("Error checking for duplicates:", duplicateError);
          return NextResponse.json(
            { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูลซ้ำ" },
            { status: 500 },
          );
        }

        if (duplicateCheck && duplicateCheck.length > 0) {
          return NextResponse.json(
            { success: false, message: "มีข้อมูลอยู่แล้วในวันที่นี้ กรุณาเลือกวันอื่น" },
            { status: 409 },
          );
        }
      }
    }

    // Get user profile data for BMR/BMI calculations
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("gender, date_of_birth, height")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { success: false, message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" },
        { status: 500 },
      );
    }

    // Prepare update fields
    const dbUpdateFields: Record<string, number | string> = {};

    // Use new values or existing values
    const bodyFatPercentage =
      updateFields.bodyFatPercentage ?? existingRecord.body_fat_percentage;
    const muscleMass = updateFields.muscleMass ?? existingRecord.muscle_mass;
    const weight = updateFields.weight ?? existingRecord.weight ?? 0;

    dbUpdateFields.body_fat_percentage = bodyFatPercentage;
    dbUpdateFields.muscle_mass = muscleMass;
    dbUpdateFields.weight = weight;

    // Handle optional visceralFat
    if (updateFields.visceralFat !== undefined) {
      dbUpdateFields.visceral_fat = updateFields.visceralFat;
    } else if (
      existingRecord.visceral_fat !== null &&
      existingRecord.visceral_fat !== undefined
    ) {
      dbUpdateFields.visceral_fat = existingRecord.visceral_fat;
    }

    // Update timestamp if provided
    if (timestamp) {
      dbUpdateFields.timestamp = timestamp;
    }

    // Calculate BMI if height is available
    if (userData?.height) {
      const heightInMeters = userData.height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      dbUpdateFields.bmi = Math.round(bmi * 10) / 10;
    }

    // Calculate BMR if all required data is available
    if (userData?.height && userData?.date_of_birth && userData?.gender) {
      const today = new Date();
      const birthDate = new Date(userData.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Mifflin-St Jeor Equation
      let bmr = 10 * weight + 6.25 * userData.height - 5 * age;

      if (userData.gender === "male") {
        bmr += 5;
      } else if (userData.gender === "female") {
        bmr -= 161;
      } else {
        // For "other", use average
        bmr -= 78;
      }

      dbUpdateFields.bmr = Math.round(bmr);
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
