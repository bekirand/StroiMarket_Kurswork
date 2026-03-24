'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type ProductData = {
    id: string;
    sku: string;
    name: string;
    price: number;
    discount: number;
    stockQuantity: number;
    isActive: boolean;
    images: string[];
    category: {
        id: string;
        name: string;
    };
};

export default function ProductsClient({ initialProducts }: { initialProducts: ProductData[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [isSyncing, setIsSyncing] = useState(false);

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStock, setFilterStock] = useState('ALL'); // ALL, IN_STOCK, OUT_OF_STOCK, LOW_STOCK
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const categories = useMemo(() => {
        const unique = new Map<string, string>();
        products.forEach(p => {
            unique.set(p.category.id, p.category.name);
        });
        return Array.from(unique.entries());
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Поиск
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                product.name.toLowerCase().includes(q) ||
                product.sku.toLowerCase().includes(q);

            // 2. Категория
            const matchesCategory = filterCategory === 'ALL' || product.category.id === filterCategory;

            // 3. Остаток
            let matchesStock = true;
            if (filterStock === 'IN_STOCK') matchesStock = product.stockQuantity > 0;
            else if (filterStock === 'OUT_OF_STOCK') matchesStock = product.stockQuantity === 0;
            else if (filterStock === 'LOW_STOCK') matchesStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

            // 4. Цена
            const matchesMinPrice = minPrice === '' || product.price >= parseFloat(minPrice);
            const matchesMaxPrice = maxPrice === '' || product.price <= parseFloat(maxPrice);

            return matchesSearch && matchesCategory && matchesStock && matchesMinPrice && matchesMaxPrice;
        });
    }, [products, searchQuery, filterCategory, filterStock, minPrice, maxPrice]);

    const hasActiveFilters = searchQuery !== '' || filterCategory !== 'ALL' || filterStock !== 'ALL' || minPrice !== '' || maxPrice !== '';

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterCategory('ALL');
        setFilterStock('ALL');
        setMinPrice('');
        setMaxPrice('');
    };

    const handleSyncImages = async () => {
        if (!confirm('Начать синхронизацию фото с ImageKit? Это может занять несколько секунд. Битые ссылки на сайте будут вычищены.')) return;
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/sync-images', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert(`Синхронизация завершена! Удалено битых ссылок: ${data.removedCount}. Пожалуйста, обновите страницу для просмотра изменений (F5).`);
            } else {
                alert('Ошибка при синхронизации.');
            }
        } catch (error) {
            console.error(error);
            alert('Сбой сети при синхронизации.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Панель фильтров */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Поиск (Название, SKU)
                    </label>
                    <input
                        type="text"
                        placeholder="Что ищем..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Категория
                    </label>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem', background: 'white', cursor: 'pointer' }}
                    >
                        <option value="ALL">Все категории</option>
                        {categories.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Остаток
                    </label>
                    <select
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem', background: 'white', cursor: 'pointer' }}
                    >
                        <option value="ALL">Любой</option>
                        <option value="IN_STOCK">В наличии</option>
                        <option value="LOW_STOCK">Мало (≤10)</option>
                        <option value="OUT_OF_STOCK">Нет в наличии</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                            Цена от
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            min="0"
                            onChange={(e) => setMinPrice(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                            до
                        </label>
                        <input
                            type="number"
                            placeholder="MAX"
                            value={maxPrice}
                            min="0"
                            onChange={(e) => setMaxPrice(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                        />
                    </div>
                </div>

                {hasActiveFilters && (
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            onClick={handleResetFilters}
                            style={{ width: '100%', padding: '10px 16px', borderRadius: '10px', background: 'var(--color-bg)', border: 'none', color: 'var(--color-gray-700)', fontWeight: 600, cursor: 'pointer', height: '42px' }}
                        >
                            Сбросить
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 'auto' }}>
                    <button
                        onClick={handleSyncImages}
                        disabled={isSyncing}
                        title="Проверить все фото на сайте и удалить битые ссылки"
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            background: '#0ea5e9',
                            border: 'none',
                            color: 'white',
                            fontWeight: 600,
                            cursor: isSyncing ? 'not-allowed' : 'pointer',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: isSyncing ? 0.7 : 1
                        }}
                    >
                        {isSyncing ? 'Синхронизация...' : '🔄 Синхронизировать фото'}
                    </button>
                </div>
            </div>

            {/* Таблица */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-subtle)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '60px' }}>Фото</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Название / Артикул</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Категория</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Цена</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Остаток</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    Товаров не найдено
                                </td>
                            </tr>
                        ) : filteredProducts.map((product) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={product.images[0] || 'https://placehold.co/100x100?text=Нет+фото'}
                                        alt={product.name}
                                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: 'var(--color-bg)' }}
                                    />
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <Link href={`/catalog/${product.sku}`} target="_blank" style={{ textDecoration: 'none', display: 'block' }}>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', color: 'var(--color-primary-600)' }}>
                                            {product.name}
                                            {!product.isActive && <span style={{ fontSize: '0.7rem', color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>Скрыт</span>}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>SKU: {product.sku}</div>
                                    </Link>
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-700)' }}>
                                    {product.category.name}
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                                    {product.price.toLocaleString('ru-RU')} ₽
                                    {product.discount > 0 && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>-{product.discount}%</span>}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
                                        background: product.stockQuantity > 10 ? '#ecfdf5' : (product.stockQuantity > 0 ? '#fffbeb' : '#fef2f2'),
                                        color: product.stockQuantity > 10 ? '#10b981' : (product.stockQuantity > 0 ? '#f59e0b' : '#ef4444')
                                    }}>
                                        {product.stockQuantity} шт
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                                    >
                                        Редактировать
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', textAlign: 'right' }}>
                Показано: {filteredProducts.length} из {products.length}
            </div>
        </div>
    );
}
