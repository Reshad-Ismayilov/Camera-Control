import { NextResponse } from "next/server";

export async function POST() {
    // Bu hissə Raspberry Pi tərəfindən dinləniləcək. 
    // Sadə mock API qaytarırıq.

    // Simulated delay for opening barrier
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("--> Relay Triggered: Barrier Opening (5 seconds)");

    // Real ssenaridə burada GPIO pini aktivləşdirilir.

    return NextResponse.json({ success: true, message: "Relay activated" });
}
