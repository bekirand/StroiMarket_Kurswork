import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import OrderHistoryClient from './OrderHistoryClient';
import styles from '../Admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminOrderHistoryPage() {
    const session = await auth();
    const userRole = session?.user?.role || 'STOREKEEPER';

    // Получаем историю вместе с заказами и пользователями, которые сделали изменение
    const history = await prisma.orderStatusHistory.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true, role: true } },
            order: { select: { id: true } }
        }
    });

    return (
        <div>
            <h1 className={styles.sectionTitle}>Логи заказов</h1>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                История изменений статусов заказов сотрудниками
            </p>

            <OrderHistoryClient initialHistory={history} userRole={userRole} />
        </div>
    );
}
