'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/admin/Admin.module.css';

const ADMIN_LINKS = [
    { href: '/admin', label: 'Дашборд', icon: '📊' },
    { href: '/admin/orders', label: 'Заказы', icon: '🛍️' },
    { href: '/admin/order-history', label: 'Логи заказов', icon: '📋' },
    { href: '/admin/products', label: 'Товары', icon: '📦' },
    { href: '/admin/categories', label: 'Категории', icon: '🏷️' },
    { href: '/admin/requests', label: 'Почта', icon: '📝' },
    { href: '/admin/reviews', label: 'Отзывы', icon: '⭐' },
    { href: '/admin/messages', label: 'Сообщения', icon: '✉️' },
    { href: '/admin/analytics', label: 'Статистика', icon: '📈' }, // Added for ADMIN and MANAGER
];

export default function Sidebar({ role }: { role: string }) {
    const pathname = usePathname();

    let links = [];

    // Настраиваем видимость пунктов в зависимости от роли
    if (role === 'STOREKEEPER') {
        // Складвщик видит только минимально необходимое
        links = ADMIN_LINKS.filter(link =>
            link.href === '/admin' || link.href === '/admin/orders' || link.href === '/admin/order-history' || link.href === '/admin/requests'
        );
    } else {
        // Менеджер и Админ видят все базовые пункты
        links = [...ADMIN_LINKS];

        // Пользователей видит только ADMIN
        if (role === 'ADMIN') {
            links.push({ href: '/admin/users', label: 'Пользователи', icon: '👥' });
        }
    }

    return (
        <aside className={styles.sidebar}>
            <Link href="/" className={styles.logoArea} style={{ textDecoration: 'none' }}>
                <div className={styles.logoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <div className={styles.logoText}>СтройМаркет</div>
            </Link>

            <nav className={styles.nav}>
                {links.map(({ href, label, icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}
                    >
                        <span>{icon}</span>
                        {label}
                    </Link>
                ))}
            </nav>

            <div style={{ padding: '24px 16px', borderTop: '1px solid var(--color-border)' }}>
                <Link href="/" className={styles.navLink} style={{ color: 'var(--color-primary-600)' }}>
                    <span>←</span> На сайт
                </Link>
            </div>
        </aside>
    );
}
