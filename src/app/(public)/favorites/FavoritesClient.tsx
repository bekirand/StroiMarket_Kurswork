'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/catalog/ProductCard';
import styles from '../catalog/Catalog.module.css';
import Link from 'next/link';

export default function FavoritesClient() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadFavorites() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/favorites', { cache: 'no-store' });
                if (!res.ok) throw new Error('Ошибка загрузки');
                const data = await res.json();

                // Преобразуем данные из Favorite + Product в просто массив Product
                const formattedProducts = data.items?.map((item: any) => ({
                    ...item.product,
                    initialIsFavorite: true // Явно передаем флаг, чтобы кнопка сразу была активной
                })) || [];

                setProducts(formattedProducts);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }
        loadFavorites();
    }, []);

    if (isLoading) {
        return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-gray-500)' }}>Загрузка сохраненных товаров...</div>;
    }

    if (error) {
        return <div style={{ padding: '60px 0', textAlign: 'center', color: '#ef4444' }}>Произошла ошибка при получении данных.</div>;
    }

    if (products.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>🤍</div>
                <div className={styles.emptyTitle}>В избранном пока пусто</div>
                <p>Добавляйте товары в избранное, нажав на сердечко в карточке товара.</p>
                <Link
                    href="/catalog"
                    style={{
                        display: 'inline-block',
                        marginTop: '24px',
                        padding: '12px 24px',
                        background: 'var(--color-primary-600)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: 600
                    }}
                >
                    Перейти в каталог
                </Link>
            </div>
        );
    }

    // Для Избранного сетку используем общую из Catalog.module.css
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 'var(--spacing-6)'
        }}>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
