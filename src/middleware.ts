import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authCookie = req.cookies.get('auth-token');
  const publicFormsRegex = /^\/forms\/(c[a-z0-9]+)$/;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const isPublicPath =
    publicFormsRegex.test(pathname) ||
    pathname === '/login';

  if (isPublicPath) {
    if (authCookie && pathname === '/login') {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  if (!authCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
