import { NextRequest, NextResponse } from "next/server";

//Proxy to get the session token
export function proxy(req: NextRequest) {
    if (!req.cookies.get("SESSION_TOKEN")?.value) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };