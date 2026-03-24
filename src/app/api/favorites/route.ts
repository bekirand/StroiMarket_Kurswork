import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const cookieStore = await cookies();
        let guestSessionId = cookieStore.get('guest_session_id')?.value;

        if (!userId && !guestSessionId) {
            return NextResponse.json({ items: [] });
        }

        const favorites = await prisma.favorite.findMany({
            where: {
                OR: [
                    userId ? { userId } : { id: 'impossible_id_1' },
                    guestSessionId ? { sessionId: guestSessionId } : { id: 'impossible_id_2' }
                ]
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        price: true,
                        images: true,
                        unit: true,
                        discount: true,
                        stockQuantity: true,
                        category: { select: { name: true, slug: true } },
                        rating: true,
                        reviewsCount: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ items: favorites });
    } catch (error) {
        console.error('[GET /api/favorites]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const session = await auth();
        const userId = session?.user?.id;
        const cookieStore = await cookies();
        let guestSessionId = cookieStore.get('guest_session_id')?.value;

        // Если нет ни юзера, ни сессии - создаем сессию (для гостей)
        if (!userId && !guestSessionId) {
            guestSessionId = crypto.randomUUID();
            cookieStore.set('guest_session_id', guestSessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 дней
                httpOnly: true,
                sameSite: 'lax',
            });
        }

        // Проверяем, есть ли уже товар в избранном
        const existing = await prisma.favorite.findFirst({
            where: {
                productId,
                OR: [
                    userId ? { userId } : { id: 'impossible_id_1' },
                    guestSessionId ? { sessionId: guestSessionId } : { id: 'impossible_id_2' }
                ]
            }
        });

        if (existing) {
            // Удаляем (Тоггл)
            await prisma.favorite.delete({ where: { id: existing.id } });
            return NextResponse.json({ added: false });
        } else {
            // Добавляем
            await prisma.favorite.create({
                data: {
                    productId,
                    userId: userId || null,
                    sessionId: !userId ? guestSessionId : null,
                }
            });
            return NextResponse.json({ added: true });
        }
    } catch (error) {
        console.error('[POST /api/favorites]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
