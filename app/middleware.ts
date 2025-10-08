// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value

  // Protect /admin route
  if (req.nextUrl.pathname.startsWith("/admin") && session !== "1") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"], // applies only to admin pages
}
