import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const origin = request.headers.get("origin") || "http://localhost:3000";
        const { text } = await request.json();
        const upperText = text.toUpperCase();
        const normalized = (s: string) => s.replace(/[^A-Z0-9]/g, "");
        const platePattern = /(\d{2})[ -]?([A-Z]{2})[ -]?(\d{2,3})/g;
        const candidates: string[] = [];
        for (const m of upperText.matchAll(platePattern)) {
            const candidate = normalized(`${m[1]}${m[2]}${m[3]}`);
            if (candidate.length >= 6 && candidate.length <= 7) {
                candidates.push(candidate);
            }
        }
        if (candidates.length === 0) {
            return NextResponse.json({ success: false, message: "Xəta: Avtomobil və ya nömrə aşkar olunmadı", text });
        }

        // Bütün aktiv müəllimləri bazadan çəkirik
        const activeTeachers = await prisma.teacher.findMany({
            where: { status: "active" }
        });

        // Bazadakı nömrələri normallaşdırıb dəqiq uyğunluğu yoxlayırıq
        let teacher: typeof activeTeachers[number] | null = null;
        const dbMap = new Map<string, typeof activeTeachers[number]>();
        for (const t of activeTeachers) {
            const key = normalized(t.plate_number.toUpperCase());
            if (key.length >= 6 && key.length <= 7) {
                dbMap.set(key, t);
            }
        }
        for (const c of candidates) {
            const t = dbMap.get(c);
            if (t) {
                teacher = t;
                break;
            }
        }

        if (teacher) {
            // ENTRY / EXIT Logic
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastSuccessLog = await prisma.entryLog.findFirst({
                where: {
                    teacher_id: teacher.id,
                    status: "success",
                    date: { gte: today },
                },
                orderBy: { entry_time: "desc" },
            });

            // If last log exists and has no exit_time, mark as EXITED
            if (lastSuccessLog && !lastSuccessLog.exit_time) {
                await prisma.entryLog.update({
                    where: { id: lastSuccessLog.id },
                    data: { exit_time: new Date() }
                });
            } else {
                // Create new ENTRY log
                await prisma.entryLog.create({
                    data: {
                        teacher_id: teacher.id,
                        plate_number: teacher.plate_number,
                        status: "success",
                        match_type: "plate",
                        entry_time: new Date(),
                    }
                });
            }

            await fetch(`${origin}/api/barrier`, { method: "POST" }).catch(() => { });

            return NextResponse.json({
                success: true,
                message: "Uğurlu: Giriş icazəsi verildi",
                teacher: teacher.full_name,
                plateNumber: teacher.plate_number,
                carModelBrand: teacher.car_model_brand
            });
        }

        // Only log to DB if it's considered a plate but not found
        await prisma.entryLog.create({
            data: {
                plate_number: text.substring(0, 15),
                status: "failed",
                match_type: "plate",
                entry_time: new Date(),
            }
        });

        // Baza yoxlamasında tapılmadıqda xəta: giriş icazəsi yoxdur
        return NextResponse.json({ success: false, message: "Xəta: Giriş icazəsi yoxdur", plateNumber: text }, { status: 403 });

    } catch (error) {
        console.error("Scan error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
