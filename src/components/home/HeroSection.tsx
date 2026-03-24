'use client';

/**
 * HeroSection — секция-баннер с параллакс-эффектом
 *
 * Параллакс реализован через:
 * 1. Фоновый div (bgRef) имеет высоту 130% от родителя и сдвинут вверх на 15%
 * 2. При прокрутке JS сдвигает его на 30% от scrollY (медленнее страницы)
 * 3. Синий градиент поверх — контент всегда читаем
 */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './HeroSection.module.css';

export default function HeroSection() {
    const bgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (bgRef.current) {
                // Коэффициент 0.35 — фото движется вдвое медленнее страницы
                bgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Инициализация: применить в начальном состоянии
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className={styles.hero}>
            {/* === Слой 1: Фото (параллакс) === */}
            <div ref={bgRef} className={styles.heroBg} aria-hidden="true" />

            {/* === Слой 2: Синий градиент === */}
            <div className={styles.heroGradient} aria-hidden="true" />

            {/* === Слой 3: Декоративные круги === */}
            <div className={styles.circle1} aria-hidden="true" />
            <div className={styles.circle2} aria-hidden="true" />

            {/* === Слой 4: Контент === */}
            <div className={`container ${styles.heroContent}`}>
                {/* Бейдж */}
                <div className={styles.badge}>
                    <span className={styles.badgeDot} />
                    <span>Более 500 товаров в наличии</span>
                </div>

                <h1 className={styles.heading}>
                    Всё для строительства —<br />
                    <span className={styles.headingAccent}>в одном месте</span>
                </h1>

                <p className={styles.subheading}>
                    Кирпич, цемент, лакокрасочные материалы, инструменты и кровля.<br />
                    Доставка по городу и области. Работаем с 2010 года.
                </p>

                {/* CTA кнопки */}
                <div className={styles.actions}>
                    <Link href="/catalog" className={styles.btnPrimary}>
                        Перейти в каталог
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <Link href="/contacts" className={styles.btnGhost}>
                        Связаться с нами
                    </Link>
                </div>

                {/* Статистика */}
                <div className={styles.stats}>
                    {[
                        { value: '500+', label: 'Товаров' },
                        { value: '5', label: 'Категорий' },
                        { value: '14', label: 'Лет на рынке' },
                        { value: '1200', label: 'Клиентов' },
                    ].map(({ value, label }) => (
                        <div key={label} className={styles.statItem}>
                            <span className={styles.statValue}>{value}</span>
                            <span className={styles.statLabel}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
