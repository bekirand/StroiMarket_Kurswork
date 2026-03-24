import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const session = await auth();

        // Проверка: только АДМИН имеет право на откат статусов напрямую из истории
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен. Требуются права Администратора.' }, { status: 403 });
        }

        const body = await req.json();
        const { orderId, revertToStatus } = body;

        if (!orderId || !revertToStatus) {
            return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
        }

        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId },
            select: { status: true },
        });

        if (!currentOrder) {
            return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
        }

        if (currentOrder.status === revertToStatus) {
            return NextResponse.json({ error: 'Текущий статус уже соответствует запрашиваемому' }, { status: 400 });
        }

        // Выполняем откат и логгируем это как обычное изменение Администратором
        const [updatedOrder] = await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status: revertToStatus as OrderStatus },
            }),
            prisma.orderStatusHistory.create({
                data: {
                    orderId: orderId,
                    userId: session.user.id,
                    oldStatus: currentOrder.status,
                    newStatus: revertToStatus as OrderStatus,
                }
            })
        ]);

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('[POST /api/admin/orders/history]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
