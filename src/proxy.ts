import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

// Optimistic gate only: every route handler re-checks the session before touching data.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!userId && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Tu sesión expiró. Volvé a ingresar." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userId && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"],
};
