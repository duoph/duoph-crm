import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware";

const protectedPrefixes = ["/dashboard", "/clients", "/cashflow", "/reports", "/settings"];

const authOnlyPaths = [
  "/auth/login",
  "/auth/signup",
  "/auth/verify-otp",
  "/auth/forgot-password",
];

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createMiddlewareSupabase(request);

  if (!supabase) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }

  if (user && authOnlyPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const dash = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.getAll().forEach((c) => dash.cookies.set(c.name, c.value));
    return dash;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
