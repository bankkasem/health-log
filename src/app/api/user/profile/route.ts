import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { DatabaseUser } from "@/types/auth";
import { toDatabaseUser, toUser } from "@/types/auth";

// GET /api/user/profile - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { data: dbUser, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single<DatabaseUser>();

    if (error || !dbUser) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
        { error: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้" },
        { status: 500 },
      );
    }

    return NextResponse.json({ user: toUser(dbUser) });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const body = await request.json();
    const { name, gender, dateOfBirth, height } = body;

    // Validation
    if (gender && !["male", "female", "other"].includes(gender)) {
      return NextResponse.json({ error: "เพศไม่ถูกต้อง" }, { status: 400 });
    }

    if (dateOfBirth) {
      const date = new Date(dateOfBirth);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ error: "วันเกิดไม่ถูกต้อง" }, { status: 400 });
      }

      // Check if date is not in the future
      if (date > new Date()) {
        return NextResponse.json(
          { error: "วันเกิดไม่สามารถเป็นวันในอนาคตได้" },
          { status: 400 },
        );
      }
    }

    if (height !== undefined && height !== null) {
      const heightNum = Number(height);
      if (Number.isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
        return NextResponse.json(
          { error: "ส่วนสูงต้องอยู่ระหว่าง 1-300 ซม." },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData = toDatabaseUser({
      ...(name !== undefined && { name }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(height !== undefined && { height }),
    });

    // Update user in database
    const { data: updatedDbUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", session.user.id)
      .select()
      .single<DatabaseUser>();

    if (error || !updatedDbUser) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { error: "ไม่สามารถอัปเดตโปรไฟล์ได้" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "อัปเดตโปรไฟล์สำเร็จ",
      user: toUser(updatedDbUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }
}
