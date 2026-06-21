import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GUEST_ONLY = ["/login", "/register", "/forgot-password", "/reset-password"];

const AUTH_REQUIRED = [
    "/tracker",
    "/insights",
    "/bookmarks",
    "/submit",
    "/notifications",
    "/profile",
    "/mock-tests",
    "/search",
    "/posts/create",
    "/dashboard",
];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasToken = request.cookies.has("token");

    if (hasToken && GUEST_ONLY.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!hasToken && AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Auth-required pages
        "/tracker/:path*",
        "/insights/:path*",
        "/bookmarks/:path*",
        "/submit/:path*",
        "/notifications/:path*",
        "/profile/:path*",
        "/mock-tests/:path*",
        "/search/:path*",
        "/posts/create",
        "/dashboard/:path*",
        // Guest-only pages
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
    ],
};
