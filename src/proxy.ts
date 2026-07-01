import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const pathname = nextUrl.pathname;

    if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        if (pathname.startsWith('/admin')) {
            const role = req.auth?.user?.role;
            if (role !== 'ADMIN' && role !== 'MANAGER' && role !== 'STOREKEEPER') {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }
    }

    if (pathname === '/login' || pathname === '/register') {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/account', req.url));
        }
    }

    return NextResponse.next();
});

// Указываем пути, к которым применяется этот middleware
export const config = {
    matcher: ['/admin/:path*', '/account/:path*', '/login', '/register'],
};
