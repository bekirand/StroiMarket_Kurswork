import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Только менеджеры и складвщики могут создавать заявки (ну и админы, если хотят проверить)
        if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN' && session.user.role !== 'STOREKEEPER')) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const body = await req.json();
        const { subject, message, toEmail, attachments } = body;

        if (!subject || !message || !toEmail) {
            return NextResponse.json({ error: 'Заполните все обязательные поля (Тема, Сообщение, Кому)' }, { status: 400 });
        }

        if (message.length > 5000) {
            return NextResponse.json({ error: 'Сообщение слишком длинное (максимум 5000 символов)' }, { status: 400 });
        }

        // Ищем получателя по Email
        const toUser = await prisma.user.findUnique({
            where: { email: toEmail }
        });

        if (!toUser) {
            return NextResponse.json({ error: 'Сотрудник с такой почтой не найден' }, { status: 400 });
        }

        const newReq = await prisma.managerRequest.create({
            data: {
                subject,
                message,
                attachments: attachments || [],
                fromUserId: session.user.id,
                toUserId: toUser.id
            }
        });

        return NextResponse.json({ success: true, request: newReq }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/admin/requests]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
