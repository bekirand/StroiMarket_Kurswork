import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';
import styles from '../Admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
    const session = await auth();

    // Защита роута (допускаются только ADMIN и MANAGER)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        redirect('/admin');
    }

    const isAdmin = session.user.role === 'ADMIN';

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 className={styles.sectionTitle}>Статистика и Аналитика</h1>
                <p style={{ color: 'var(--color-gray-500)' }}>
                    Графики выручки и количества заказов по месяцам и дням
                </p>
            </div>

            <AnalyticsClient isAdmin={isAdmin} />
        </div>
    );
}
