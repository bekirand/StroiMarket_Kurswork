'use client';

import { useState, useEffect } from 'react';

type ReviewActionLogWithRelations = {
    id: string;
    action: 'DELETE' | 'RESTORE';
    details: string | null;
    createdAt: Date | string;
    user: { name: string; email: string };
    review: {
        product: { name: string; sku: string };
        user: { name: string };
    };
};

interface Props {
    initialLogs: any[];
}

export default function ReviewLogsClient({ initialLogs }: Props) {
    const [logs, setLogs] = useState<ReviewActionLogWithRelations[]>(initialLogs);
    const [isLoading, setIsLoading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [period, setPeriod] = useState('ALL');

    useEffect(() => {
        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/admin/reviews/logs?q=${encodeURIComponent(searchQuery)}&period=${period}`);
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error('Failed to fetch review logs', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchFiltered, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, period]);

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
                        Поиск (Модератор, Товар, Артикул, Текст)
                    </label>
                    <input
                        type="text"
                        placeholder="Найти действие..."
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

                <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 'auto' }}>
                    <button
                        onClick={async () => {
                            if (!confirm('Вы уверены, что хотите полностью очистить весь журнал действий? Это безвозвратное действие.')) return;
                            setIsClearing(true);
                            try {
                                const res = await fetch('/api/admin/reviews/logs', { method: 'DELETE' });
                                if (res.ok) {
                                    setLogs([]);
                                    alert('Журнал успешно очищен!');
                                } else {
                                    alert('Ошибка при очистке журнала');
                                }
                            } catch (e) {
                                console.error(e);
                                alert('Сбой сети');
                            } finally {
                                setIsClearing(false);
                            }
                        }}
                        disabled={isClearing || logs.length === 0}
                        style={{
                            padding: '10px 16px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 600,
                            cursor: (isClearing || logs.length === 0) ? 'not-allowed' : 'pointer',
                            opacity: (isClearing || logs.length === 0) ? 0.6 : 1,
                            minWidth: '150px'
                        }}
                    >
                        {isClearing ? 'Очистка...' : '🗑️ Очистить журнал'}
                    </button>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-subtle)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '20%' }}>Модератор</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '15%' }}>Действие</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '20%' }}>Товар</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '30%' }}>Детали (Текст отзыва)</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', width: '15%' }}>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    Загрузка...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    История пуста
                                </td>
                            </tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 600 }}>{log.user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{log.user.email}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: log.action === 'DELETE' ? '#fee2e2' : '#ecfdf5',
                                        color: log.action === 'DELETE' ? '#dc2626' : '#059669'
                                    }}>
                                        {log.action === 'DELETE' ? 'УДАЛЕНИЕ' : 'ВОССТАНОВЛЕНИЕ'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 500 }}>{log.review.product.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{log.review.product.sku}</div>
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-600)', fontSize: '0.85rem' }}>
                                    <div style={{ fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {log.details || '—'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginTop: '2px' }}>
                                        Автор отзыва: {log.review.user.name}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-500)' }}>
                                    {new Date(log.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
