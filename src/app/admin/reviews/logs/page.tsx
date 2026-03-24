import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ReviewLogsClient from './ReviewLogsClient';

export default async function ReviewLogsPage() {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/admin');
    }

    const logs = await prisma.reviewActionLog.findMany({
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
        take: 100
    });

    return (
        <div className="admin-page">
            <div style={{ marginBottom: '24px' }}>
                <Link href="/admin/reviews" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                    ← Назад к отзывам
                </Link>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px' }}>Журнал действий модераторов</h1>
                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.95rem' }}>История удаления и восстановления отзывов администраторами и менеджерами</p>
            </div>

            <ReviewLogsClient initialLogs={logs} />
        </div>
    );
}
