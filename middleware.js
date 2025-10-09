import { NextResponse } from "next/server";

// Pfad, der geschützt werden soll
const ADMIN_PATH = "/admin";

// Basic Auth Middleware
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_PATH)) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");

  if (!auth) {
    return new Response("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }

  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) {
    return new Response("Invalid authorization header", { status: 400 });
  }

  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const [user, pass] = decoded.split(":");

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return NextResponse.next();
  }

  return new Response("Access Denied", {
    status: 403,
    headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"], // schützt /admin und alle Unterseiten
};
