import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We can't use firebase-admin in Edge runtime directly, so we check for the presence of session cookies
// or we make an API call to a route that handles verification if needed. 
// For basic protection, checking if the cookie exists is a first step, then validating it.
// To fully validate using Firebase Admin, it needs to be done either in a Node.js API route 
// or by trusting the cookie presence at the Edge and validating deeply in layouts/pages.

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register') ||
                     request.nextUrl.pathname.startsWith('/onboarding');
                     
  // If the user tries to access /dashboard or any protected route without a session
  if (!sessionCookie && !isAuthPage && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Removed auto-redirect to dashboard to allow re-authentication on the login page

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|models).*)',
  ],
};
