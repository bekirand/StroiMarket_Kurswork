import { prisma } from '@/lib/prisma';
import OrdersClient from './OrdersClient';
import styles from '../Admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: { product: { select: { name: true, sku: true } } }
            }
        }
    });

    return (
        <div>
            <h1 className={styles.sectionTitle}>Управление заказами ({orders.length})</h1>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                Просмотр и изменение статусов заказов клиентов
            </p>

            <OrdersClient initialOrders={orders} />
        </div>
    );
}
