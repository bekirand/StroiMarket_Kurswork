import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/admin/Sidebar';
import styles from './Admin.module.css';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Middleware уже защищает, но на всякий случай проверяем
    if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN' && session.user.role !== 'STOREKEEPER')) {
        redirect('/');
    }

    return (
        <div className={styles.layout}>
            {/* Левая боковая панель */}
            <Sidebar role={session.user.role} />

            {/* Правая основная часть */}
            <main className={styles.main}>
                {/* Верхняя панель (Topbar) */}
                <header className={styles.topbar}>
                    <Link
                        href="/account"
                        className={styles.userProfile}
                    >
                        <div style={{ textAlign: 'right' }}>
                            <div className={styles.userName}>{session.user.name}</div>
                            <div className={styles.userRole}>{session.user.role}</div>
                        </div>
                        <div className={styles.avatar}>
                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </Link>
                </header>

                {/* Контент страницы */}
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
