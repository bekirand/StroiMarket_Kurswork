/**
 * Footer — подвал публичного сайта
 * Тёмный фон, 4-колоночный grid, контакты и копирайт
 */
import Link from 'next/link';
import styles from './Footer.module.css';

function IconHome() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function IconPhone() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.08h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
    );
}

function IconMail() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    );
}

function IconMap() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

const currentYear = new Date().getFullYear();

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.top}>
                <div className={`container ${styles.grid}`}>

                    {/* Колонка 1: Бренд и контакты */}
                    <div className={styles.brand}>
                        <Link href="/" className={styles.footerLogo} aria-label="На главную">
                            <span className={styles.footerLogoIcon}>
                                <IconHome />
                            </span>
                            <span className={styles.footerLogoText}>СтройМаркет</span>
                        </Link>
                        <p className={styles.description}>
                            Широкий выбор строительных материалов высокого качества. Работаем с 2010 года. Доставка по городу и области.
                        </p>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <IconPhone />
                                <a href="tel:+78001234567">8 (800) 123-45-67</a>
                            </div>
                            <div className={styles.contactItem}>
                                <IconMail />
                                <a href="mailto:info@stroymarket.ru">info@stroymarket.ru</a>
                            </div>
                            <div className={styles.contactItem}>
                                <IconMap />
                                <span>г. Москва, ул. Строительная, 1</span>
                            </div>
                        </div>
                    </div>

                    {/* Колонка 2: Покупателям */}
                    <div className={styles.column}>
                        <p className={styles.columnTitle}>Покупателям</p>
                        <div className={styles.columnLinks}>
                            <Link href="/catalog" className={styles.footerLink}>Каталог товаров</Link>
                            <Link href="/cart" className={styles.footerLink}>Корзина</Link>
                            <Link href="/account" className={styles.footerLink}>Личный кабинет</Link>
                            <Link href="/account" className={styles.footerLink}>Мои заказы</Link>
                        </div>
                    </div>

                    {/* Колонка 3: О компании */}
                    <div className={styles.column}>
                        <p className={styles.columnTitle}>Компания</p>
                        <div className={styles.columnLinks}>
                            <Link href="/about" className={styles.footerLink}>О нас</Link>
                            <Link href="/contacts" className={styles.footerLink}>Контакты</Link>
                        </div>
                    </div>

                    {/* Колонка 4: Клиентам */}
                    <div className={styles.column}>
                        <p className={styles.columnTitle}>Поддержка</p>
                        <div className={styles.columnLinks}>
                            <Link href="/support#order" className={styles.footerLink}>Как сделать заказ</Link>
                            <Link href="/support#delivery" className={styles.footerLink}>Доставка и оплата</Link>
                            <Link href="/support#return" className={styles.footerLink}>Возврат товара</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Нижняя полоска с копирайтом */}
            <div className={styles.bottom}>
                <div className={`container ${styles.bottomInner}`}>
                    <p className={styles.copyright}>
                        © {currentYear} СтройМаркет. Все права защищены.
                    </p>
                    <div className={styles.bottomLinks}>
                        <Link href="/privacy-policy" className={styles.footerLink}>Политика конфиденциальности</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
