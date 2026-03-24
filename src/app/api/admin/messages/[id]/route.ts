import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, canDeleteMessages: true }
        });

        if (!user || (user.role !== 'ADMIN' && (!user.canDeleteMessages || user.role !== 'MANAGER'))) {
            return NextResponse.json({ error: 'Нет прав на удаление сообщений.' }, { status: 403 });
        }

        await prisma.contactMessage.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/admin/messages/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
