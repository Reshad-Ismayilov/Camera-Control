import { NextResponse } from 'next/server';

// This is a dynamic route
export const dynamic = 'force-dynamic';

export async function GET() {
    // In a real application, you would check the actual connection 
    // to the hardware (e.g., via ping, socket status, or database).
    // For now, we return a mock status.

    return NextResponse.json({
        camera: "online",   // can be "online" or "offline" (problem)
        barrier: "online"   // can be "online" or "offline" (problem)
    });
}
