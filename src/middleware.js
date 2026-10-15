import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedExactRoutes = [
  "/profile",
  "/profile/edit",
  "/fundraise/create",
];

// API routes that require authentication (POST/PUT/PATCH/DELETE only)
const protectedApiRoutes = [
  "/api/fundraisers",  // POST (create)
  "/api/users",        // PATCH (update)
  "/api/donations",    // POST (create)
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if it's a protected page route (own profile / edit / create fundraiser)
  // Public profiles /profile/[id] are open to everyone
  const isProtectedPage = protectedExactRoutes.includes(pathname);

  // Check if it's a protected API route with a mutating method
  const isProtectedApi =
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
    protectedApiRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

  // Also protect fundraiser edit pages
  const isFundraiserEdit = pathname.startsWith("/fundraiser/edit/");

  if (isProtectedPage || isProtectedApi || isFundraiserEdit) {
    const isSecure =
      request.nextUrl.protocol === "https:" ||
      request.cookies.has("__Secure-next-auth.session-token");
    const primaryCookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    let token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: primaryCookieName,
    });

    if (!token) {
      // Fallback check in case protocol and cookie prefix differ
      const fallbackCookieName = isSecure
        ? "next-auth.session-token"
        : "__Secure-next-auth.session-token";
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: fallbackCookieName,
      });
    }

    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }

      // Redirect to login for page routes
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected pages
    "/profile/:path*",
    "/fundraise/create",
    "/fundraiser/edit/:path*",
    // Protected APIs
    "/api/fundraisers/:path*",
    "/api/users/:path*",
    "/api/donations/:path*",
  ],
};
