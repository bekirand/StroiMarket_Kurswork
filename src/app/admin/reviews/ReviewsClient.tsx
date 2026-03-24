'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ReviewWithRelation = {
    id: string;
    rating: number;
    text: string;
    images: string[];
    createdAt: Date | string;
    isDeleted: boolean;
    user: { name: string; email: string };
    product: { name: string; sku: string; id: string };
};

interface Props {
    initialReviews: any[];
    permissions: {
        canDelete: boolean;
        isAdmin: boolean;
    };
}

export default function ReviewsClient({ initialReviews, permissions }: Props) {
    const router = useRouter();
    const [reviews, setReviews] = useState<ReviewWithRelation[]>(initialReviews);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [period, setPeriod] = useState('ALL'); // day, week, month, year, ALL
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    // Функтор для подгрузки данных при смене фильтров
    useEffect(() => {
        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/admin/reviews?q=${encodeURIComponent(searchQuery)}&period=${period}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Failed to fetch reviews', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchFiltered, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, period]);

    const handleToggleStatus = async (reviewId: string, currentDeleted: boolean) => {
        if (!permissions.canDelete) return;

        const action = currentDeleted ? 'RESTORE' : 'DELETE';
        const confirmMsg = (isDelete: boolean) => isDelete
            ? 'Вы уверены, что хотите УДАЛИТЬ этот отзыв? Он перестанет отображаться на сайте.'
            : 'Восстановить отзыв? Он снова станет виден всем пользователям.';

        if (!confirm(confirmMsg(!currentDeleted))) return;

        setIsUpdating(reviewId);
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, action })
            });

            if (res.ok) {
                // Локально обновляем состояние
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, isDeleted: !currentDeleted } : r
                ));
                router.refresh();
            } else {
                alert('Ошибка при выполнении действия');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сервера');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleHardDelete = async (reviewId: string) => {
        if (!permissions.isAdmin) return;

        if (!confirm('ВНИМАНИЕ: Вы собираетесь УДАЛИТЬ НАВСЕГДА этот отзыв. Фотографии также будут безвозвратно удалены с серверов ImageKit.\n\nПродолжить?')) return;

        setIsUpdating(`hard_${reviewId}`);
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, action: 'HARD_DELETE' })
            });

            if (res.ok) {
                // Локально удаляем отзыв из списка
                setReviews(prev => prev.filter(r => r.id !== reviewId));
                router.refresh();
            } else {
                alert('Ошибка при выполнении действия');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сервера');
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Панель фильтров */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Поиск (Товар, Артикул, Пользователь, Текст)
                    </label>
                    <input
                        type="text"
                        placeholder="Найти отзыв..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Период
                    </label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem', background: 'white', cursor: 'pointer' }}
                    >
                        <option value="ALL">Всё время</option>
                        <option value="day">За последние 24 часа</option>
                        <option value="week">За неделю</option>
                        <option value="month">За месяц</option>
                        <option value="year">За год</option>
                    </select>
                </div>
            </div>

            {/* Список отзывов */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-subtle)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '25%' }}>Товар</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '15%' }}>Автор</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '35%' }}>Отзыв</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '15%' }}>Дата</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '10%', textAlign: 'right' }}>Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    Загрузка отзывов...
                                </td>
                            </tr>
                        ) : reviews.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    Отзывов не найдено
                                </td>
                            </tr>
                        ) : reviews.map((review) => (
                            <tr key={review.id} style={{
                                borderBottom: '1px solid var(--color-bg-subtle)',
                                opacity: review.isDeleted ? 0.6 : 1,
                                background: review.isDeleted ? '#fff1f2' : 'transparent'
                            }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <Link href={`/catalog/${review.product.sku}`} target="_blank" style={{ textDecoration: 'none' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>{review.product.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>{review.product.sku}</div>
                                    </Link>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 500 }}>{review.user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>{review.user.email}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ marginBottom: '4px', color: '#f59e0b' }}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4', color: 'var(--color-gray-700)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {review.text}
                                    </div>
                                    {review.isDeleted && (
                                        <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                                            [ УДАЛЕНО ]
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>
                                    {new Date(review.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        <button
                                            onClick={() => handleToggleStatus(review.id, review.isDeleted)}
                                            disabled={isUpdating !== null}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid',
                                                borderColor: review.isDeleted ? '#10b981' : '#ef4444',
                                                background: review.isDeleted ? '#ecfdf5' : '#fef2f2',
                                                color: review.isDeleted ? '#059669' : '#dc2626',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s',
                                                width: '120px'
                                            }}
                                        >
                                            {isUpdating === review.id ? '...' : (review.isDeleted ? 'Восстановить' : 'Удалить')}
                                        </button>

                                        {permissions.isAdmin && (
                                            <button
                                                onClick={() => handleHardDelete(review.id)}
                                                disabled={isUpdating !== null}
                                                title="Удалить отзыв и фото навсегда с ImageKit"
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: '#dc2626',
                                                    color: 'white',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    width: '120px'
                                                }}
                                            >
                                                {isUpdating === `hard_${review.id}` ? 'Удаление...' : 'Навсегда'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
