/**
 * Главная страница — Server Component
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './Home.module.css';
import HeroSection from '@/components/home/HeroSection';
import AnimatedCounters from '@/components/home/AnimatedCounters';
import WhyUsSection from '@/components/home/WhyUsSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import ProductCard from '@/components/catalog/ProductCard';
import { getFeaturedProducts } from '@/lib/products';

export const metadata: Metadata = {
    title: 'Главная — СтройМаркет',
    description: 'СтройМаркет — широкий выбор строительных материалов с доставкой. Кирпич, цемент, краска, инструменты и кровля.',
};

// Категории с фото-подложками
const CATEGORIES = [
    {
        name: 'Лакокрасочные',
        slug: 'lakokrasochnye',
        count: 4,
        image: '/images/cat-paint.png',
        // Цветной запасной градиент если нет фото
        fallbackGradient: 'linear-gradient(135deg, #fef3c7, #f59e0b)',
    },
    {
        name: 'Кирпич и блоки',
        slug: 'kirpich-i-bloki',
        count: 4,
        image: '/images/cat-bricks.png',
        fallbackGradient: 'linear-gradient(135deg, #fee2e2, #ef4444)',
    },
    {
        name: 'Цемент и смеси',
        slug: 'cement-i-smesi',
        count: 4,
        image: '/images/cat-cement.png',
        fallbackGradient: 'linear-gradient(135deg, #f1f5f9, #64748b)',
    },
    {
        name: 'Инструменты',
        slug: 'instrumenty',
        count: 4,
        image: '/images/cat-tools.png',
        fallbackGradient: 'linear-gradient(135deg, #fff7ed, #f97316)',
    },
    {
        name: 'Кровля и фасад',
        slug: 'krovlya-i-fasad',
        count: 4,
        image: '/images/cat-roofing.png',
        fallbackGradient: 'linear-gradient(135deg, #ecfdf5, #10b981)',
    },
];

export default async function HomePage() {
    // Популярные товары из БД (с graceful fallback)
    let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
    try {
        featuredProducts = await getFeaturedProducts(4);
    } catch {
        // если БД недоступна — просто не показываем секцию
    }

    return (
        <>
            {/* 1. Hero с параллаксом */}
            <HeroSection />

            {/* 2. Анимированные счётчики */}
            <AnimatedCounters />

            {/* 3. Преимущества */}
            <section style={{ padding: '72px 0', background: 'var(--color-bg)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '8px' }}>
                            Наши преимущества
                        </h2>
                        <p style={{ color: 'var(--color-gray-500)' }}>Что делает нас лучшим выбором</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                        {[
                            { icon: '🚚', title: 'Быстрая доставка', desc: 'Доставка по городу и области в день заказа или на следующий день.' },
                            { icon: '✅', title: 'Гарантия качества', desc: 'Все товары сертифицированы и соответствуют ГОСТ.' },
                            { icon: '💰', title: 'Выгодные цены', desc: 'Прямые поставки от производителей без посредников.' },
                            { icon: '🏗️', title: 'Большой выбор', desc: 'Более 500 позиций строительных материалов в наличии.' },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className={styles.featureCard}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
                                <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1rem', color: 'var(--color-gray-900)' }}>{title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', lineHeight: 1.6 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Категории с фото-карточками */}
            <section style={{ padding: '0 0 72px', background: 'var(--color-bg-muted)' }}>
                <div className="container">
                    <div style={{ paddingTop: '56px', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '8px' }}>
                            Категории товаров
                        </h2>
                        <p style={{ color: 'var(--color-gray-500)', fontSize: '1rem' }}>
                            Найдите всё необходимое для вашего проекта
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '20px',
                    }}>
                        {CATEGORIES.map(({ name, slug, count, image, fallbackGradient }) => (
                            <Link key={slug} href={`/catalog?category=${slug}`} className={styles.categoryCard}>
                                {/* Фото-фон */}
                                <div
                                    className={styles.categoryPhoto}
                                    style={{
                                        backgroundImage: `url('${image}'), ${fallbackGradient}`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                                {/* Подпись снизу */}
                                <div className={styles.categoryLabel}>
                                    <div className={styles.categoryLabelName}>{name}</div>
                                    <div className={styles.categoryLabelCount}>{count} товара →</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Почему мы */}
            <WhyUsSection />

            {/* 6. Отзывы */}
            <ReviewsSection />

            {/* 7. Популярные товары */}
            {featuredProducts.length > 0 && (
                <section style={{ padding: '64px 0', background: 'var(--color-bg-subtle)' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '4px' }}>Популярные товары</h2>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.95rem' }}>Выбор наших покупателей</p>
                            </div>
                            <Link href="/catalog" style={{ fontSize: '0.9rem', color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600, fontFamily: 'var(--font-family)' }}>
                                Весь каталог →
                            </Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {featuredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. CTA-баннер */}
            <section style={{
                padding: '72px 0',
                background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                        Нужна помощь с выбором?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '32px', fontSize: '1.1rem' }}>
                        Наши специалисты помогут подобрать материалы под ваш проект и рассчитать нужное количество
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/contacts" className={styles.btnWhite}>
                            Связаться с нами
                        </Link>
                        <Link href="/catalog" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '14px 28px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.12)', color: 'white',
                            fontWeight: 500, fontSize: '1rem', textDecoration: 'none',
                            border: '1.5px solid rgba(255,255,255,0.25)',
                            fontFamily: 'var(--font-family)',
                        }}>
                            Смотреть каталог
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
