import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
    const hasToken = req.cookies.has("token");

    if (hasToken && isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (!hasToken && !isAuthPage) {
        const loginUrl = new URL("/login", req.url);
        if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};
