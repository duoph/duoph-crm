import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

const protectedPrefixes = ["/dashboard", "/work", "/clients", "/cashflow", "/reports", "/settings"];

const authOnlyPaths = ["/auth/login", "/auth/forgot-password"];

export async function middleware(request: NextRequest) {
  const user = await getSessionFromRequest(request);
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (user && authOnlyPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
