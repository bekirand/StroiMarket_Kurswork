import { prisma } from '@/lib/prisma';
import styles from './Admin.module.css';
import Link from 'next/link';
import OrdersClient from './orders/OrdersClient';

// Статусы заявок на русском (для бейджей)
const STATUS_MAP: Record<string, { label: string, color: string, bg: string }> = {
    NOVIY: { label: 'Новый', color: '#3b82f6', bg: '#eff6ff' },
    PODTVERZHDEN: { label: 'Подтверждён', color: '#8b5cf6', bg: '#f5f3ff' },
    V_OBRABOTKE: { label: 'В обработке', color: '#f59e0b', bg: '#fffbeb' },
    OTPRAVLEN: { label: 'Отправлен', color: '#06b6d4', bg: '#ecfeff' },
    DOSTAVLEN: { label: 'Доставлен', color: '#10b981', bg: '#ecfdf5' },
    OTMENEN: { label: 'Отменён', color: '#ef4444', bg: '#fef2f2' },
};

export default async function AdminDashboardPage() {
    // Определяем текущий месяц
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Название месяца на русском
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const currentMonthName = monthNames[now.getMonth()];

    // Получаем статистику параллельно
    const [
        totalOrders,
        totalRevenueArray,
        totalProducts,
        totalUsers,
        recentOrders
    ] = await Promise.all([
        prisma.order.count({
            where: { createdAt: { gte: startOfMonth, lte: endOfMonth } }
        }),
        prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: {
                status: { not: 'OTMENEN' },
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        }),
        prisma.product.count({
            where: { createdAt: { gte: startOfMonth, lte: endOfMonth } }
        }),
        prisma.user.count({
            where: {
                role: 'CUSTOMER',
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        }),
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                items: {
                    include: { product: { select: { name: true, sku: true } } }
                }
            }
        })
    ]);

    const totalRevenue = totalRevenueArray._sum.totalPrice || 0;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <h1 className={styles.sectionTitle}>Обзор</h1>
                <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>
                    За текущий месяц ({currentMonthName})
                </span>
            </div>

            <div className={styles.statGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Выручка</div>
                    <div className={styles.statValue}>{totalRevenue.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Заказы</div>
                    <div className={styles.statValue}>{totalOrders}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Новые товары</div>
                    <div className={styles.statValue}>{totalProducts}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Новые клиенты</div>
                    <div className={styles.statValue}>{totalUsers}</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Последние заказы</h2>
                    <Link href="/admin/orders" style={{ fontSize: '0.9rem', color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600 }}>
                        Смотреть все →
                    </Link>
                </div>
                <div style={{ padding: '0 24px 24px' }}>
                    <OrdersClient initialOrders={recentOrders as any} />
                </div>
            </div>
        </div>
    );
}
