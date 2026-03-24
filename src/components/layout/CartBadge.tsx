'use client';
/**
 * CartBadge — счётчик корзины в шапке сайта
 * Client Component (нужен для useCart)
 */
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function CartBadge({ className }: { className?: string }) {
    const { totalItems } = useCart();
    return (
        <Link
            href="/cart"
            aria-label={`Корзина, ${totalItems} товаров`}
            className={`${styles.cartButton} ${className || ''}`.trim()}
        >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
                <span className={styles.cartBadge}>
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </Link>
    );
}
