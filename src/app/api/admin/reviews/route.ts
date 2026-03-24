import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { deleteImageKitFileByUrl } from '@/lib/imagekit';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const period = searchParams.get('period') || 'ALL'; // day, week, month, year, ALL

        let dateFilter = {};
        const now = new Date();

        if (period === 'day') {
            dateFilter = { gte: new Date(now.setDate(now.getDate() - 1)) };
        } else if (period === 'week') {
            dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
        } else if (period === 'month') {
            dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
        } else if (period === 'year') {
            dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        }

        const reviews = await prisma.review.findMany({
            where: {
                createdAt: dateFilter,
                OR: [
                    { product: { name: { contains: q, mode: 'insensitive' } } },
                    { product: { sku: { contains: q, mode: 'insensitive' } } },
                    { text: { contains: q, mode: 'insensitive' } },
                    { user: { name: { contains: q, mode: 'insensitive' } } },
                    { user: { email: { contains: q, mode: 'insensitive' } } }
                ]
            },
            include: {
                user: { select: { name: true, email: true } },
                product: { select: { name: true, sku: true, id: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('[GET /api/admin/reviews]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Проверяем права: ADMIN или MANAGER с canDeleteReviews
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!dbUser || (dbUser.role !== 'ADMIN' && !dbUser.canDeleteReviews)) {
            return NextResponse.json({ error: 'Forbidden. Insufficient permissions.' }, { status: 403 });
        }

        const { reviewId, action } = await req.json();

        if (!reviewId || !['DELETE', 'RESTORE', 'HARD_DELETE'].includes(action)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        if (action === 'HARD_DELETE' && dbUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Only admins can hard delete.' }, { status: 403 });
        }

        const isDelete = action === 'DELETE';
        const isHardDelete = action === 'HARD_DELETE';

        // Ищем отзыв
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { product: true }
        });

        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        const productId = review.productId;

        if (isHardDelete) {
            // Безвозвратное удаление с удалением картинок из ImageKit
            if (review.images && Array.isArray(review.images)) {
                review.images.forEach((imgUrl: string) => {
                    deleteImageKitFileByUrl(imgUrl).catch(console.error);
                });
            }

            await prisma.review.delete({
                where: { id: reviewId }
            });

            // Не создаем ReviewActionLog, так как сам отзыв (и его логи по каскаду) полностью удален из БД,
            // попытка привязать лог к удаленному reviewId вызовет ошибку внешнего ключа (foreign key constraint).
        } else {
            // Мягкое удаление / Восстановление
            await prisma.review.update({
                where: { id: reviewId },
                data: {
                    isDeleted: isDelete,
                    deletedAt: isDelete ? new Date() : null,
                    deletedByUserId: isDelete ? session.user.id : null
                }
            });

            await prisma.reviewActionLog.create({
                data: {
                    reviewId,
                    userId: session.user.id,
                    action: isDelete ? 'DELETE' : 'RESTORE',
                    details: isDelete ? review.text : 'Restored'
                }
            });
        }

        // Пересчитываем рейтинг товара
        const aggregations = await prisma.review.aggregate({
            _avg: { rating: true },
            _count: { id: true },
            where: { productId, isDeleted: false }
        });

        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: aggregations._avg.rating || 0,
                reviewsCount: aggregations._count.id || 0
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PATCH /api/admin/reviews]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
