import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        // Проверка: только ADMIN может менять роли
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен. Требуются права Администратора.' }, { status: 403 });
        }

        const body = await req.json();
        const { role, canChangeOrderStatus, canDeleteReviews, canDeleteMessages } = body;

        // Нельзя изменить роль самому себе через этот API (защита от случайных действий)
        if (session.user.id === id && role !== undefined) {
            return NextResponse.json({ error: 'Нельзя изменить роль самому себе' }, { status: 400 });
        }

        const updateData: any = {};

        if (role !== undefined) {
            if (!Object.values(UserRole).includes(role as UserRole)) {
                return NextResponse.json({ error: 'Недопустимая роль' }, { status: 400 });
            }
            updateData.role = role as UserRole;
        }

        if (canChangeOrderStatus !== undefined) {
            updateData.canChangeOrderStatus = Boolean(canChangeOrderStatus);
        }

        if (canDeleteReviews !== undefined) {
            updateData.canDeleteReviews = Boolean(canDeleteReviews);
        }

        if (canDeleteMessages !== undefined) {
            updateData.canDeleteMessages = Boolean(canDeleteMessages);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, role: true, canChangeOrderStatus: true, canDeleteReviews: true, canDeleteMessages: true } // Не возвращаем пароль
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error('[PATCH /api/admin/users/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
