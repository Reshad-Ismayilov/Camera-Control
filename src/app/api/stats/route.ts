import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const now = new Date();

        // Today
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

        // This Month Start
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

        const logsDaily = await prisma.entryLog.findMany({
            where: { date: { gte: today } }
        });

        const logsMonthly = await prisma.entryLog.findMany({
            where: { date: { gte: thisMonth } }
        });

        const daily = {
            success: logsDaily.filter(l => l.status === "success").length,
            failed: logsDaily.filter(l => l.status === "failed").length,
            total: logsDaily.length
        };

        const monthly = {
            success: logsMonthly.filter(l => l.status === "success").length,
            failed: logsMonthly.filter(l => l.status === "failed").length,
            total: logsMonthly.length
        };

        return NextResponse.json({ daily, monthly });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
