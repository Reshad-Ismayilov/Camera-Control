import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const teachers = await prisma.teacher.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(teachers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { full_name, plate_number, status, car_model_brand } = body;

        const teacher = await prisma.teacher.create({
            data: {
                full_name,
                plate_number,
                status: status || "active",
                car_model_brand,
            }
        });

        return NextResponse.json(teacher, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Plate number already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
    }
}
