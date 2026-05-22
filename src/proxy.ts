import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_ROUTES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);

  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Kein Redirect von /login bei vorhandenem Cookie: getSessionCookie prüft
  // nur die Existenz des Tokens, nicht ob die Session noch gültig ist.
  // Sonst entsteht eine Schleife login → dashboard → login bei abgelaufenen Tokens.
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
