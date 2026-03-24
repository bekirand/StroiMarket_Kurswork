import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function PATCH(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        // Проверка прав доступа (Админ, Менеджер или Складвщик)
        if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN' && session.user.role !== 'STOREKEEPER') {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        // Проверяем, есть ли право изменять статусы у этого пользователя
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { canChangeOrderStatus: true },
        });

        if (!dbUser?.canChangeOrderStatus && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Вам запрещено изменять статусы заказов.' }, { status: 403 });
        }

        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
        }

        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                status: true,
                items: { select: { productId: true, quantity: true } }
            },
        });

        if (!currentOrder) {
            return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
        }

        if (currentOrder.status === status) {
            return NextResponse.json({ error: 'Новый статус совпадает с текущим' }, { status: 400 });
        }

        const wasCancelled = currentOrder.status === 'OTMENEN';
        const isCancelled = status === 'OTMENEN';

        const stockUpdates: any[] = [];

        if (!wasCancelled && isCancelled) {
            // Если заказ отменен, возвращаем товары на склад
            for (const item of currentOrder.items) {
                stockUpdates.push(
                    prisma.product.update({
                        where: { id: item.productId },
                        data: { stockQuantity: { increment: item.quantity } }
                    })
                );
            }
        } else if (wasCancelled && !isCancelled) {
            // Если заказ восстанавливают из отмененного, снова списываем
            for (const item of currentOrder.items) {
                stockUpdates.push(
                    prisma.product.update({
                        where: { id: item.productId },
                        data: { stockQuantity: { decrement: item.quantity } }
                    })
                );
            }
        }

        // Используем транзакцию для атомарности
        const [updatedOrder] = await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status: status as OrderStatus },
            }),
            prisma.orderStatusHistory.create({
                data: {
                    orderId: orderId,
                    userId: session.user.id,
                    oldStatus: currentOrder.status,
                    newStatus: status as OrderStatus,
                }
            }),
            ...stockUpdates
        ]);

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('[PATCH /api/admin/orders]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
