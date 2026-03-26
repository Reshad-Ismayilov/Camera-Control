import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");

        let whereClause = {};
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            whereClause = {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            };
        }

        const logs = await prisma.entryLog.findMany({
            where: whereClause,
            include: {
                teacher: true,
            },
            orderBy: {
                date: "desc",
            },
            take: 100, // Limit for recent logs
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
