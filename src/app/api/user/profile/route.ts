import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { deleteImageKitFileByUrl } from '@/lib/imagekit';

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, image } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 });
        }

        const oldUser = await prisma.user.findUnique({ where: { email: session.user.email } });

        // Если картинка изменилась и старая существовала, удаляем её из ImageKit
        if (oldUser?.image && image && image.trim() !== oldUser.image) {
            deleteImageKitFileByUrl(oldUser.image).catch(console.error);
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: name.trim(),
                phone: phone?.trim() || null,
                image: image?.trim() || null,
            },
        });

        // Не возвращаем весь объект пользователя (особенно хэш пароля)
        return NextResponse.json({
            message: 'Профиль обновлен',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                image: updatedUser.image,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, name: true, email: true, phone: true, image: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
