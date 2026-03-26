import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);

        const worksheet = workbook.worksheets[0];
        const newTeachers: any[] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const full_name = row.getCell(1).text?.trim();
            let plate_number = row.getCell(2).text?.trim().toUpperCase();

            if (full_name && plate_number) {
                newTeachers.push({
                    full_name,
                    plate_number,
                    status: "active",
                });
            }
        });

        if (newTeachers.length > 0) {
            // Create many but skip duplicates based on plate_number if possible 
            // Prisma createMany skipDuplicates is supported in some DBs, or we can use loop
            await Promise.allSettled(
                newTeachers.map((teacher) =>
                    prisma.teacher.upsert({
                        where: { plate_number: teacher.plate_number },
                        update: { full_name: teacher.full_name },
                        create: teacher,
                    })
                )
            );
        }

        return NextResponse.json({ success: true, count: newTeachers.length });
    } catch (error) {
        console.error("Excel import error", error);
        return NextResponse.json({ error: "Failed to import excel" }, { status: 500 });
    }
}
