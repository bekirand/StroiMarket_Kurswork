import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReviewsClient from './ReviewsClient';

export default async function AdminReviewsPage() {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        redirect('/api/auth/signin');
    }

    // Получаем начальные данные (последние 50 отзывов)
    const reviews = await prisma.review.findMany({
        include: {
            user: { select: { name: true, email: true } },
            product: { select: { name: true, sku: true, id: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, canDeleteReviews: true }
    });

    const permissions = {
        canDelete: dbUser?.role === 'ADMIN' || !!dbUser?.canDeleteReviews,
        isAdmin: dbUser?.role === 'ADMIN'
    };

    return (
        <div className="admin-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Управление отзывами</h1>
                {permissions.isAdmin && (
                    <a
                        href="/admin/reviews/logs"
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            background: 'var(--color-gray-900)',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        📜 Журнал действий
                    </a>
                )}
            </div>

            <ReviewsClient initialReviews={reviews} permissions={permissions} />
        </div>
    );
}
