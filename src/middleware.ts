import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "supersecretkey_dev");

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const isAuthPage = req.nextUrl.pathname.startsWith("/admin/login");
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/teachers") || req.nextUrl.pathname.startsWith("/api/logs");

    if (isAuthPage) {
        if (token) {
            try {
                await jwtVerify(token, JWT_SECRET);
                return NextResponse.redirect(new URL("/admin/dashboard", req.url));
            } catch (err) {
                // invalid token, stay on login
            }
        }
        return NextResponse.next();
    }

    if (isAdminRoute || isApiAdminRoute) {
        if (!token) {
            if (isApiAdminRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (err) {
            if (isApiAdminRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            const response = NextResponse.redirect(new URL("/admin/login", req.url));
            response.cookies.delete("token");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/teachers/:path*", "/api/logs/:path*"],
};
