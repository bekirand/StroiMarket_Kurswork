import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const pathname = nextUrl.pathname;

    // Если пытаемся зайти в админку или аккаунт, но сессии нет — редирект на логин
    if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Если нужна админка, но роль не ADMIN, MANAGER или STOREKEEPER — доступ запрещен (на главную)
        if (pathname.startsWith('/admin')) {
            const role = req.auth?.user?.role;
            if (role !== 'ADMIN' && role !== 'MANAGER' && role !== 'STOREKEEPER') {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }
    }

    // Если мы на странице логина/регистрации, но уже авторизованы — редирект в аккаунт
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
