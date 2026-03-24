import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { UserRole } from '@/generated/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        // Базовая валидация
        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Пароль должен быть не менее 6 символов' }, { status: 400 });
        }

        // Проверка, существует ли пользователь
        const userExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userExists) {
            return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Создаем пользователя в БД
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim(),
                passwordHash,
                role: UserRole.CUSTOMER
            }
        });

        // Возвращаем результат без хеша пароля
        return NextResponse.json(
            { message: 'Регистрация успешна', user: { id: user.id, name: user.name, email: user.email } },
            { status: 201 }
        );

    } catch (error) {
        console.error('[POST /api/auth/register]', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
