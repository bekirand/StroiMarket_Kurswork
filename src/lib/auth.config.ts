import type { NextAuthConfig } from "next-auth";

// Эта часть конфигурации совместима с Edge (middleware)
// Здесь нет PrismaAdapter и модулей Node.js (bcrypt)
export const authConfig = {
    pages: {
        signIn: "/login",
    },
    providers: [], // Инициализируем пустым, добавим провайдеры в auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
} satisfies NextAuthConfig;
