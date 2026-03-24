/**
 * /catalog — Страница каталога товаров
 * Server Component: принимает searchParams, делает Prisma-запрос
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/catalog/ProductCard';
import FilterSidebar from './FilterSidebar';
import styles from './Catalog.module.css';

export const metadata: Metadata = {
    title: 'Каталог товаров',
    description: 'Строительные материалы: кирпич, цемент, краска, инструменты и кровля.',
};

// Next.js 15 — searchParams является Promise
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;

    const search = typeof params.search === 'string' ? params.search : undefined;
    const categorySlug = typeof params.category === 'string' ? params.category : undefined;

    // Параллельные запросы к БД с обработкой ошибок
    let products: Awaited<ReturnType<typeof getProducts>> = [];
    let categories: Awaited<ReturnType<typeof getCategories>> = [];
    let dbError = false;

    try {
        [products, categories] = await Promise.all([
            getProducts({ search, categorySlug }),
            getCategories(),
        ]);
    } catch (err) {
        console.error('[CatalogPage] DB error:', err);
        dbError = true;
    }

    const currentCategoryName = categories.find(c => c.slug === categorySlug)?.name;

    // БД недоступна — дружелюбное сообщение вместо Internal Server Error
    if (dbError) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.header}>
                        <h1 className={styles.title}>Каталог товаров</h1>
                    </div>
                    <div style={{
                        background: '#fffbeb', border: '1.5px solid #f59e0b',
                        borderRadius: '16px', padding: '40px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px', color: '#92400e' }}>
                            База данных временно недоступна
                        </h2>
                        <p style={{ color: '#78350f', marginBottom: '20px', maxWidth: '480px', margin: '0 auto 20px' }}>
                            Supabase (бесплатный тариф) приостановил проект из-за неактивности.
                            Войдите в Dashboard и нажмите <strong>«Resume project»</strong>.
                        </p>
                        <a
                            href="https://supabase.com/dashboard"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-block', padding: '11px 24px',
                                background: '#1d4ed8', color: 'white',
                                borderRadius: '10px', fontWeight: 600, textDecoration: 'none',
                                fontFamily: 'var(--font-family)',
                            }}
                        >
                            Открыть Supabase Dashboard →
                        </a>
                        <p style={{ marginTop: '14px', color: '#9ca3af', fontSize: '0.8rem' }}>
                            После возобновления обновите страницу
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Заголовок */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {currentCategoryName ?? 'Каталог товаров'}
                    </h1>
                    <p className={styles.subtitle}>
                        {search
                            ? `Результаты поиска по «${search}»: ${products.length} товаров`
                            : `Найдено ${products.length} товаров`
                        }
                    </p>
                </div>

                {/* Layout: сайдбар + сетка */}
                <div className={styles.layout}>
                    <Suspense fallback={<div className={styles.sidebar}>Загрузка...</div>}>
                        <FilterSidebar
                            categories={categories}
                            currentCategory={categorySlug}
                            currentSearch={search}
                        />
                    </Suspense>

                    <div className={styles.grid}>
                        {products.length === 0 ? (
                            <div className={styles.empty}>
                                <div className={styles.emptyIcon}>🔍</div>
                                <div className={styles.emptyTitle}>Товары не найдены</div>
                                <p>Попробуйте изменить параметры поиска</p>
                            </div>
                        ) : (
                            products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

