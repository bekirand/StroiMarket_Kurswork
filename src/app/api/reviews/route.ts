import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: { productId, isDeleted: false },
            include: { user: { select: { name: true, image: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('[GET /api/reviews]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized. Only logged in users can leave reviews.' }, { status: 401 });
        }

        const body = await req.json();
        const { productId, rating, text, images = [], videos = [], criteriaRatings } = body;

        if (!productId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5 || !text) {
            return NextResponse.json({ error: 'Invalid data. ProductId, rating (1-5), and text are required.' }, { status: 400 });
        }

        const deliveredOrdersCount = await prisma.order.count({
            where: {
                userId,
                status: 'DOSTAVLEN',
                items: {
                    some: { productId },
                }
            }
        });

        if (deliveredOrdersCount === 0) {
            return NextResponse.json({ error: 'Вы можете оставить отзыв только после покупки и доставки данного товара.' }, { status: 403 });
        }

        const existingReviewsCount = await prisma.review.count({
            where: { userId, productId, isDeleted: false }
        });

        if (existingReviewsCount >= deliveredOrdersCount) {
            return NextResponse.json({ error: 'Вы уже оставили максимальное количество отзывов для ваших покупок этого товара.' }, { status: 403 });
        }

        // Создаем отзыв
        const review = await prisma.review.create({
            data: {
                productId,
                userId,
                rating,
                text,
                images,
                videos,
                criteriaRatings
            }
        });

        // Пересчитываем средний рейтинг товара
        const aggregations = await prisma.review.aggregate({
            _avg: { rating: true },
            _count: { id: true },
            where: { productId, isDeleted: false }
        });

        const newRating = aggregations._avg.rating || 0;
        const newReviewsCount = aggregations._count.id || 0;

        // Обновляем товар
        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: newRating,
                reviewsCount: newReviewsCount
            }
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error('[POST /api/reviews]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
