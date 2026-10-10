import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Next.js middleware for:
 * 1. Security headers (CSP, HSTS, etc.)
 * 2. Auth-based route protection
 *
 * See: KEYCAP_PLATFORM_SPEC.md Section 11.2
 */
export default auth((req) => {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // ─── Security Headers ──────────────────────────────────────
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  // ─── Route Protection ──────────────────────────────────────

  // Admin routes: require ADMIN role
  if (pathname.startsWith('/admin')) {
    const role = (req.auth?.user as Record<string, unknown> | undefined)?.role;
    if (!req.auth?.user || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }
  }

  // App routes: require authentication
  if (pathname.startsWith('/app')) {
    if (!req.auth?.user) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, req.url),
      );
    }
  }

  return res;
});

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - API webhooks (they handle their own auth via signatures)
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
};
