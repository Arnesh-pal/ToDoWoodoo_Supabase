// middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    const res = NextResponse.next();
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // If the user is not logged in and is trying to access a protected route
    if (!session && pathname.startsWith('/dashboard')) {
        const url = req.nextUrl.clone();
        url.pathname = '/Login'; // Redirect to login
        return NextResponse.redirect(url);
    }

    // If the user is logged in and tries to go to the Login or Signup page
    if (session && (pathname === '/Login' || pathname === '/Signup')) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard'; // Redirect to the dashboard
        return NextResponse.redirect(url);
    }

    return res;
}

// Ensure the middleware is only called for relevant paths.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};