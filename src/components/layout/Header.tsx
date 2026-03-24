'use client';

/**
 * Header — шапка публичного сайта
 * Sticky-позиционирование, blur-фон при прокрутке, мобильное меню
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './Header.module.css';
import CartBadge from './CartBadge';
import GlobalSearch from './GlobalSearch';

// Иконки через SVG (без сторонних библиотек)
function IconHome() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function IconSearch() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function IconCart() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    );
}

function IconUser() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function IconMenu() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function IconClose() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function IconHeart() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    );
}

// Навигационные ссылки
const NAV_LINKS = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/about', label: 'О компании' },
    { href: '/contacts', label: 'Контакты' },
];

export default function Header() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Определяем tень при прокрутке страницы
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Закрываем мобильное меню при смене маршрута
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);



    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.inner}`}>

                {/* Логотип */}
                <Link href="/" className={styles.logo} aria-label="На главную">
                    <span className={styles.logoIcon}>
                        <IconHome />
                    </span>
                    <span className={styles.logoText}>
                        Строй<span className={styles.logoAccent}>Маркет</span>
                    </span>
                </Link>

                {/* Навигация (десктоп) */}
                <nav className={styles.nav} aria-label="Основная навигация">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${styles.navLink} ${pathname.startsWith(href) ? styles.active : ''}`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Поиск */}
                <GlobalSearch />

                {/* Действия: корзина + аккаунт */}
                <div className={styles.actions}>
                    {/* Избранное */}
                    <Link href="/favorites" className={styles.cartButton} aria-label="Избранное">
                        <IconHeart />
                    </Link>

                    {/* Корзина — счётчик реальный из CartContext */}
                    <CartBadge />

                    {/* Кнопка входа / личный кабинет */}
                    {status === 'loading' ? (
                        <div style={{ width: '80px', height: '38px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-lg)' }} />
                    ) : session ? (
                        <Link
                            href="/account"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0 16px',
                                height: '38px',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
                                color: 'white',
                                background: 'var(--color-primary-600)',
                                border: '1.5px solid var(--color-primary-600)',
                                borderRadius: 'var(--radius-lg)',
                                textDecoration: 'none',
                                transition: 'all var(--transition-fast)',
                                fontFamily: 'var(--font-family)',
                            }}
                        >
                            <IconUser />
                            <span>Профиль</span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0 16px',
                                height: '38px',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
                                color: 'var(--color-primary-600)',
                                background: 'var(--color-primary-50)',
                                border: '1.5px solid var(--color-primary-200)',
                                borderRadius: 'var(--radius-lg)',
                                textDecoration: 'none',
                                transition: 'all var(--transition-fast)',
                                fontFamily: 'var(--font-family)',
                            }}
                        >
                            <IconUser />
                            <span>Войти</span>
                        </Link>
                    )}

                    {/* Кнопка мобильного меню */}
                    <button
                        className={styles.menuToggle}
                        onClick={() => setIsMobileMenuOpen(prev => !prev)}
                        aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <IconClose /> : <IconMenu />}
                    </button>
                </div>
            </div>

            {/* Мобильное меню */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
                {NAV_LINKS.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={styles.mobileNavLink}
                    >
                        {label}
                    </Link>
                ))}
                <Link href={session ? "/account" : "/login"} className={styles.mobileNavLink}>
                    {session ? "Личный кабинет" : "Войти / Регистрация"}
                </Link>
            </div>
        </header>
    );
}
