import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import styles from '../Admin.module.css';
import RequestsClient from './RequestsClient';

export const dynamic = 'force-dynamic';

export default async function AdminRequestsPage() {
    const session = await auth();
    if (!session) return null;

    const isAdmin = session.user.role === 'ADMIN';

    // Все сотрудники видят только свою переписку (Входящие и Отправленные)
    const requests = await prisma.managerRequest.findMany({
        where: {
            OR: [
                { fromUserId: session.user.id },
                { toUserId: session.user.id }
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
            fromUser: { select: { name: true, email: true } },
            toUser: { select: { name: true, email: true } }
        }
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 24px' }}>
                <div>
                    <h1 className={styles.sectionTitle}>Внутренняя почта</h1>
                    <p style={{ color: 'var(--color-gray-500)' }}>
                        Обмен документами и заявлениями между сотрудниками
                    </p>
                </div>
            </div>

            <RequestsClient initialRequests={requests as any} isAdmin={isAdmin} currentUserId={session.user.id} currentUserEmail={session.user.email || ''} />
        </div>
    );
}
