import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes (dashboard, products) but not the login page
  if (
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/admin/products")
  ) {
    const session = req.cookies.get("admin_session")?.value;
    const expectedToken = process.env.ADMIN_SESSION_TOKEN;

    if (!session || !expectedToken || session !== expectedToken) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard", "/admin/dashboard/:path*", "/admin/products", "/admin/products/:path*"],
};
