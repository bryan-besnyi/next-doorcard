import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    console.log("[DEBUG] Middleware:", {
      pathname: req.nextUrl.pathname,
      sessionToken: sessionToken ? "EXISTS" : "NOT_FOUND",
      cookies: req.cookies.getAll().map((c) => c.name),
    });

    // Redirect authenticated users away from /login and / to /dashboard
    if (
      sessionToken &&
      (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/")
    ) {
      console.log(
        "[DEBUG] Middleware: Redirecting authenticated user to /dashboard"
      );
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Let withAuth handle all other cases
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // Protect everything except:
    // - API routes
    // - _next (static files)
    // - public files (favicon, etc)
    // - login and register pages
    // - view routes (public doorcard pages)
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|view).*)",
    "/", // Add home page to matcher
  ],
};
