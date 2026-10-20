import { NextResponse, type NextRequest } from "next/server";
import { loginPathFor, safeNextPath } from "@/lib/redirect";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/v2/login", "/api/auth/login"];

// Optimistic gate only: every route handler re-checks the session before touching data.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const loginPath = loginPathFor(pathname);
  const home = loginPath === "/v2/login" ? "/v2" : "/";

  if (!userId && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Tu sesión expiró. Volvé a ingresar." }, { status: 401 });
    }
    // Remember where the user was headed so login can send them back there.
    const loginUrl = new URL(loginPath, request.url);
    if (pathname !== home) loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (userId && pathname === loginPath) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"), home);
    return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"],
};
