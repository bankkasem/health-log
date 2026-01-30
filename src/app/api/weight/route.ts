import type { WeightMetrics } from "@/types/weight";
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "weight-log.xlsx");

export async function GET() {
  try {
    // Check if file exists
    try {
      const fileBuffer = await fs.readFile(FILE_PATH);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      return NextResponse.json({ success: true, data });
    } catch (_error) {
      // File doesn't exist, return empty array
      return NextResponse.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error("Error reading Excel:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอ่านข้อมูล" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry: WeightMetrics = body;

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    let workbook: XLSX.WorkBook;
    let worksheet: XLSX.WorkSheet;

    // Check if file exists
    try {
      const fileBuffer = await fs.readFile(FILE_PATH);
      workbook = XLSX.read(fileBuffer, { type: "buffer" });
      worksheet = workbook.Sheets[workbook.SheetNames[0]];
    } catch (_error) {
      // File doesn't exist, create new workbook
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Weight Log");
    }

    // Convert entry to Thai headers format
    const excelEntry = {
      "วันที่/เวลา": entry.timestamp,
      เปอร์เซ็นต์ไขมันในร่างกาย: entry.bodyFatPercentage,
      "มวลกล้ามเนื้อ (kg)": entry.muscleMass,
      ไขมันในช่องท้อง: entry.visceralFat,
      BMR: entry.bmr,
      BMI: entry.bmi,
    };

    // Convert worksheet to JSON to append new row
    const data = XLSX.utils.sheet_to_json(worksheet);
    data.push(excelEntry);

    // Create new worksheet with updated data
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;

    // Write to file
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    await fs.writeFile(FILE_PATH, wbout);

    return NextResponse.json({ success: true, message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error saving to Excel:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 },
    );
  }
}
