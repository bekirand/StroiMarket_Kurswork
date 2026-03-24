import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from '../Admin.module.css';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const session = await auth();

    // Экстра защита: страница доступна ТОЛЬКО администраторам
    if (session?.user?.role !== 'ADMIN') {
        redirect('/admin');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            canChangeOrderStatus: true,
            canDeleteReviews: true,
            canDeleteMessages: true,
            createdAt: true,
        }
    });

    return (
        <div>
            <h1 className={styles.sectionTitle}>Управление пользователями ({users.length})</h1>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                Изменение ролей пользователей (Доступно только Администраторам)
            </p>

            <UsersClient initialUsers={users} currentUserId={session.user.id} />
        </div>
    );
}
