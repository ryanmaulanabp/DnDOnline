import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Definisikan protected routes (Rute yang memerlukan otentikasi)
  const protectedRoutes = ["/profile", "/characters/new", "/campaigns"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Jika ini adalah protected route, lakukan pemeriksaan token sesi NextAuth secara edge-safe
  if (isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Redirect anonymous user ke halaman login custom
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Siapkan Response
  const response = NextResponse.next();

  // 3. Tambahkan Enterprise-Grade Security Headers (OWASP Mitigations)
  
  // Content Security Policy (CSP):
  // Didesain aman namun kompatibel dengan aset eksternal D&D Online (Google Fonts, Dicebear, Itch.zone)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https://api.dicebear.com https://img.itch.zone;
    media-src 'self' https://www.soundhelix.com https://assets.mixkit.co;
    connect-src 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  
  // Anti-Clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Anti-MIME-Sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Membatasi pengiriman data referrer
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Paksa koneksi aman (HSTS)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  
  // Nonaktifkan akses browser ke hardware sensor yang tidak diperlukan untuk D&D
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Pelindung XSS Warisan untuk kompatibilitas browser lama
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

// Konfigurasi matcher agar proxy tidak memproses static assets atau file visual local
export const config = {
  matcher: [
    /*
     * Jalankan proxy pada semua rute kecuali rute-rute static assets, favicon,
     * dan api routes eksternal yang dikecualikan.
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api/auth/register).*)",
  ],
};
