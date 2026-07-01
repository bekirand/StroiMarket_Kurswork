import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { DeliveryType, OrderStatus } from '@/generated/prisma';
import { randomBytes } from 'crypto';

function generateShortId(): string {
    const bytes = randomBytes(5).toString('hex').toUpperCase(); // 10 символов
    return `${bytes.slice(0, 5)}-${bytes.slice(5, 10)}`;
}

export interface OrderItemInput {
    productId: string;
    sku: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
}

export interface CreateOrderBody {
    name: string;
    phone: string;
    email?: string;
    deliveryType: 'DELIVERY' | 'PICKUP';
    address?: string;
    comment?: string;
    items: OrderItemInput[];
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Оформление заказа доступно только авторизованным пользователям.' }, { status: 401 });
        }

        const body: CreateOrderBody = await req.json();

        // Базовая валидация
        if (!body.name?.trim()) {
            return NextResponse.json({ error: 'Укажите имя' }, { status: 400 });
        }
        if (!body.phone?.trim()) {
            return NextResponse.json({ error: 'Укажите телефон' }, { status: 400 });
        }
        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
        }
        if (body.deliveryType === 'DELIVERY' && !body.address?.trim()) {
            return NextResponse.json({ error: 'Укажите адрес доставки' }, { status: 400 });
        }

        // Считаем сумму
        const totalAmount = body.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Маппинг client-side → DB enum (DeliveryType.ADDRESS = доставка по адресу)
        const dbDeliveryType: DeliveryType =
            body.deliveryType === 'DELIVERY' ? DeliveryType.ADDRESS : DeliveryType.PICKUP;

        // Проверяем наличие товаров (опционально, но желательно)
        const productIds = body.items.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, stockQuantity: true, name: true }
        });

        for (const item of body.items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                return NextResponse.json({ error: `Товар ${item.name} не найден` }, { status: 400 });
            }
            if (product.stockQuantity < item.quantity) {
                return NextResponse.json({ error: `Недостаточно товара ${product.name} в наличии. Доступно: ${product.stockQuantity}` }, { status: 400 });
            }
        }

        const orderId = generateShortId();

        const [order] = await prisma.$transaction([
            prisma.order.create({
                data: {
                    id: orderId,
                    customerName: body.name.trim(),
                    customerPhone: body.phone.trim(),
                    customerEmail: body.email?.trim() || null,
                    deliveryType: dbDeliveryType,
                    deliveryAddress: body.address?.trim() || null,
                    comment: body.comment?.trim() || null,
                    totalPrice: totalAmount,
                    status: OrderStatus.NOVIY,
                    userId: session?.user?.id || null,
                    items: {
                        create: body.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                select: { id: true, createdAt: true },
            }),
            ...body.items.map(item =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stockQuantity: { decrement: item.quantity } }
                })
            )
        ]);

        return NextResponse.json(
            { orderId: order.id, orderNumber: order.id },
            { status: 201 }
        );
    } catch (err) {
        console.error('[POST /api/orders]', err);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
