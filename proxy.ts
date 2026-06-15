import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    const { pathname } = request.nextUrl;

    const protectedRoutes = ["/submit", "/dashboard"];

    const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    if (authRoutes.includes(pathname)) {
        if (token) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/submit/:path*",
        "/dashboard/:path*",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password"
    ],
};
