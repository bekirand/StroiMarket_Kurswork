import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await auth();
        // Только Администраторы могут смотреть логи
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const period = searchParams.get('period') || 'ALL';

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

        const logs = await prisma.reviewActionLog.findMany({
            where: {
                createdAt: dateFilter,
                OR: [
                    { user: { name: { contains: q, mode: 'insensitive' } } },
                    { user: { email: { contains: q, mode: 'insensitive' } } },
                    { review: { product: { name: { contains: q, mode: 'insensitive' } } } },
                    { review: { product: { sku: { contains: q, mode: 'insensitive' } } } },
                    { details: { contains: q, mode: 'insensitive' } }
                ]
            },
            include: {
                user: { select: { name: true, email: true } },
                review: {
                    include: {
                        product: { select: { name: true, sku: true } },
                        user: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('[GET /api/admin/reviews/logs]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.reviewActionLog.deleteMany({}); // Удаляем все записи

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/admin/reviews/logs]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
