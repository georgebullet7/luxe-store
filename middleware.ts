// Authentication + route protection middleware.
// Swap in Clerk's `clerkMiddleware` once keys are configured.
//
//   import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
//   const isProtected = createRouteMatcher(["/dashboard(.*)", "/admin(.*)", "/checkout(.*)"]);
//   export default clerkMiddleware(async (auth, req) => {
//     if (isProtected(req)) await auth.protect();
//   });
//
// Until then, a pass-through that still sets security headers:
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
