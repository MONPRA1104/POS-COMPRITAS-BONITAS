import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "default_super_secret_key_for_development";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  // If user is accessing the login page, let them pass
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Check for the session cookie
  const session = request.cookies.get("session")?.value;

  // If there's no session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the JWT token
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    
    const user = payload.user as any;
    const path = request.nextUrl.pathname;

    // Granular protection
    if (path.startsWith("/ventas") || path.startsWith("/caja")) {
      if (!user.canAccessPOS) return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/inventario") || path.startsWith("/productos") || path.startsWith("/promociones")) {
      if (!user.canAccessInventory) return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/clientes") || path.startsWith("/pedidos")) {
      if (!user.canAccessCustomers) return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/gastos")) {
      if (!user.canAccessExpenses) return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/reportes")) {
      if (!user.canAccessReports) return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/configuracion")) {
      if (!user.canAccessSettings) return NextResponse.redirect(new URL("/", request.url));
    }

    // If valid, allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // If token is invalid or expired, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

// Protect all routes except static files, API routes, and login
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
