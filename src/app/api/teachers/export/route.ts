import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
    try {
        const teachers = await prisma.teacher.findMany({
            orderBy: { createdAt: "desc" }
        });

        const workbook = new ExcelJS.Workbook();

        const sheet = workbook.addWorksheet("Müəllimlər və Maşınlar");
        sheet.columns = [
            { header: "Ad Soyad", key: "full_name", width: 30 },
            { header: "Nömrə", key: "plate_number", width: 20 },
            { header: "Status", key: "status", width: 15 },
        ];

        teachers.forEach((teacher) => {
            sheet.addRow({
                full_name: teacher.full_name,
                plate_number: teacher.plate_number,
                status: teacher.status === "active" ? "Aktiv" : "Deaktiv",
            });
        });

        sheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Disposition": 'attachment; filename="ndu_muellimler_masinlar.xlsx"',
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to export teachers" }, { status: 500 });
    }
}
