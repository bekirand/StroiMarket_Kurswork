'use client';

/**
 * FilterSidebar — боковая панель фильтров каталога
 * Client Component: обновляет URL-параметры при изменении фильтров
 */
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import styles from './Catalog.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
}

interface Props {
    categories: Category[];
    currentCategory?: string;
    currentSearch?: string;
}

export default function FilterSidebar({ categories, currentCategory, currentSearch }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilter = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    }, [router, pathname, searchParams]);

    return (
        <aside className={styles.sidebar}>
            {/* Поиск */}
            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Поиск</h3>
                <input
                    type="search"
                    placeholder="Название, артикул..."
                    defaultValue={currentSearch ?? ''}
                    className={styles.searchInput}
                    onChange={e => {
                        const q = e.target.value.trim();
                        updateFilter('search', q || null);
                    }}
                />
            </div>

            {/* Категории */}
            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Категория</h3>
                <ul className={styles.categoryList}>
                    <li>
                        <button
                            className={`${styles.categoryBtn} ${!currentCategory ? styles.active : ''}`}
                            onClick={() => updateFilter('category', null)}
                        >
                            Все категории
                            <span className={styles.catCount}>
                                {categories.reduce((s, c) => s + c._count.products, 0)}
                            </span>
                        </button>
                    </li>
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <button
                                className={`${styles.categoryBtn} ${currentCategory === cat.slug ? styles.active : ''}`}
                                onClick={() => updateFilter('category', cat.slug)}
                            >
                                {cat.name}
                                <span className={styles.catCount}>{cat._count.products}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
