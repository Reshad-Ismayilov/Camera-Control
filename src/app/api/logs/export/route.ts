import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
    try {
        const logs = await prisma.entryLog.findMany({
            include: { teacher: true },
            orderBy: { date: "desc" }
        });

        const workbook = new ExcelJS.Workbook();

        // Logs Sheet
        const logsSheet = workbook.addWorksheet("Logs");
        logsSheet.columns = [
            { header: "ID", key: "id", width: 30 },
            { header: "Müəllim / Ad Soyad", key: "full_name", width: 30 },
            { header: "Nömrə", key: "plate_number", width: 15 },
            { header: "Tarix", key: "date", width: 15 },
            { header: "Giriş Vaxtı", key: "entry_time", width: 15 },
            { header: "Çıxış Vaxtı", key: "exit_time", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Yoxlama Tipi", key: "match_type", width: 15 },
        ];

        logs.forEach((log) => {
            logsSheet.addRow({
                id: log.id,
                full_name: log.teacher?.full_name || "Naməlum",
                plate_number: log.plate_number,
                date: log.date.toLocaleDateString(),
                entry_time: log.entry_time ? log.entry_time.toLocaleTimeString() : "-",
                exit_time: log.exit_time ? log.exit_time.toLocaleTimeString() : "-",
                status: log.status,
                match_type: log.match_type,
            });
        });

        // Formatting Header
        logsSheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Disposition": 'attachment; filename="ndu_girish_loglari.xlsx"',
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to export logs" }, { status: 500 });
    }
}
