'use client';

/**
 * PromoBar — информационная полоска над шапкой
 * Показывает акции и преимущества. Можно закрыть.
 */
import { useState } from 'react';
import styles from './PromoBar.module.css';

export default function PromoBar() {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) return null;

    return (
        <div className={styles.bar} role="banner">
            <div className={styles.inner}>
                <span className={styles.item}>🚚 Бесплатная доставка от 5 000 ₽</span>
                <span className={styles.divider} aria-hidden="true" />
                <span className={styles.item}>✅ Гарантия качества на все товары</span>
                <span className={styles.divider} aria-hidden="true" />
                <span className={styles.item}>📞 8 (800) 123-45-67 — бесплатно</span>
            </div>
            <button
                className={styles.close}
                onClick={() => setIsVisible(false)}
                aria-label="Закрыть уведомление"
            >
                ✕
            </button>
        </div>
    );
}
