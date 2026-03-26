import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
    try {
        const { params } = context;
        let id = params.id;
        if (typeof params.then === 'function') {
            const awaitedParams = await params;
            id = awaitedParams.id;
        }

        const body = await request.json();

        const teacher = await prisma.teacher.update({
            where: { id },
            data: { ...body }
        });

        return NextResponse.json(teacher);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const { params } = context;
        let id = params.id;
        if (typeof params.then === 'function') {
            const awaitedParams = await params;
            id = awaitedParams.id;
        }

        await prisma.teacher.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
    }
}
