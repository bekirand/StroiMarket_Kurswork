import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { RequestStatus } from '@prisma/client';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const existingReq = await prisma.managerRequest.findUnique({
            where: { id }
        });

        if (!existingReq) {
            return NextResponse.json({ error: 'Письмо не найдено' }, { status: 404 });
        }

        // Только получатель письма может менять его статус
        if (existingReq.toUserId !== session.user.id) {
            return NextResponse.json({ error: 'Доступ запрещен. Только получатель может менять статус письма.' }, { status: 403 });
        }

        const body = await req.json();
        const { status } = body;

        if (!Object.values(RequestStatus).includes(status as RequestStatus)) {
            return NextResponse.json({ error: 'Недопустимый статус' }, { status: 400 });
        }

        const updatedReq = await prisma.managerRequest.update({
            where: { id },
            data: { status: status as RequestStatus }
        });

        return NextResponse.json({ success: true, request: updatedReq });
    } catch (error: any) {
        console.error('[PATCH /api/admin/requests/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const existingReq = await prisma.managerRequest.findUnique({
            where: { id }
        });

        if (!existingReq) {
            return NextResponse.json({ error: 'Письмо не найдено' }, { status: 404 });
        }

        const isSender = existingReq.fromUserId === session.user.id;
        const isRecipient = existingReq.toUserId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isSender && !isRecipient && !isAdmin) {
            return NextResponse.json({ error: 'Доступ запрещен. Только участники переписки или администраторы могут удалить письмо.' }, { status: 403 });
        }

        await prisma.managerRequest.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/admin/requests/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

