'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@prisma/client';

type OrderStatusHistoryData = {
    id: string;
    oldStatus: OrderStatus;
    newStatus: OrderStatus;
    createdAt: Date;
    orderId: string;
    userId: string;
    user: { name: string | null; email: string; role: string };
    order: { id: string };
};

const STATUS_MAP = {
    NOVIY: { label: 'Новый', color: '#3b82f6', bg: '#eff6ff' },
    PODTVERZHDEN: { label: 'Подтверждён', color: '#8b5cf6', bg: '#f5f3ff' },
    V_OBRABOTKE: { label: 'В обработке', color: '#f59e0b', bg: '#fffbeb' },
    OTPRAVLEN: { label: 'Отправлен', color: '#06b6d4', bg: '#ecfeff' },
    DOSTAVLEN: { label: 'Доставлен', color: '#10b981', bg: '#ecfdf5' },
    OTMENEN: { label: 'Отменён', color: '#ef4444', bg: '#fef2f2' },
};

export default function OrderHistoryClient({ initialHistory, userRole }: { initialHistory: OrderStatusHistoryData[], userRole: string }) {
    const router = useRouter();
    const [history, setHistory] = useState(initialHistory);
    const [revertingId, setRevertingId] = useState<string | null>(null);

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const handleRevert = async (historyRecord: OrderStatusHistoryData) => {
        if (!confirm(`Вы уверены, что хотите вернуть заказ ${historyRecord.orderId} обратно на статус "${STATUS_MAP[historyRecord.oldStatus]?.label}"?\nЭто действие восстановит статус заказа и запишет новый лог.`)) {
            return;
        }

        setRevertingId(historyRecord.id);
        try {
            const res = await fetch('/api/admin/orders/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: historyRecord.orderId,
                    revertToStatus: historyRecord.oldStatus
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Ошибка при откате статуса');

            alert('Статус успешно возвращён!');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setRevertingId(null);
        }
    };

    const filteredHistory = useMemo(() => {
        return history.filter(record => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                record.orderId.toLowerCase().includes(q) ||
                (record.user.name && record.user.name.toLowerCase().includes(q)) ||
                record.user.email.toLowerCase().includes(q);

            const dateStr1 = new Date(record.createdAt).toLocaleDateString('ru-RU');
            const dateStr2 = new Date(record.createdAt).toISOString().split('T')[0];
            const matchesDate = !filterDate || dateStr1.includes(filterDate) || dateStr2.includes(filterDate);

            return matchesSearch && matchesDate;
        });
    }, [history, searchQuery, filterDate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Панель фильтров */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Поиск (ID заказа, Сотрудник)
                    </label>
                    <input
                        type="text"
                        placeholder="Кого или что ищем..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Дата (ДД.ММ.ГГГГ)
                    </label>
                    <input
                        type="text"
                        placeholder="Например, 22.02.2026"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }}
                    />
                </div>
                {(searchQuery || filterDate) && (
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            onClick={() => { setSearchQuery(''); setFilterDate(''); }}
                            style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--color-bg)', border: 'none', color: 'var(--color-gray-700)', fontWeight: 600, cursor: 'pointer', height: '42px' }}
                        >
                            Сбросить
                        </button>
                    </div>
                )}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-subtle)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Дата и время</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Заказ</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Сотрудник</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Изменение статуса</th>
                            {userRole === 'ADMIN' && (
                                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Адм. действие</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    История пуста
                                </td>
                            </tr>
                        ) : filteredHistory.map((record) => (
                            <tr key={record.id} style={{ borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                <td style={{ padding: '16px 24px', color: 'var(--color-gray-600)' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>
                                        {new Date(record.createdAt).toLocaleDateString('ru-RU')}
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {new Date(record.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                                    <a href={`/admin/orders`} style={{ color: 'var(--color-primary-600)', textDecoration: 'none' }}>
                                        {record.orderId}
                                    </a>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 600 }}>{record.user.name || 'Аноним'} ({record.user.role})</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>{record.user.email}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                            background: STATUS_MAP[record.oldStatus]?.bg || '#f1f5f9',
                                            color: STATUS_MAP[record.oldStatus]?.color || '#475569'
                                        }}>
                                            {STATUS_MAP[record.oldStatus]?.label || record.oldStatus}
                                        </span>
                                        <span style={{ color: 'var(--color-gray-400)' }}>→</span>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                            background: STATUS_MAP[record.newStatus]?.bg || '#f1f5f9',
                                            color: STATUS_MAP[record.newStatus]?.color || '#475569'
                                        }}>
                                            {STATUS_MAP[record.newStatus]?.label || record.newStatus}
                                        </span>
                                    </div>
                                </td>
                                {userRole === 'ADMIN' && (
                                    <td style={{ padding: '16px 24px' }}>
                                        <button
                                            onClick={() => handleRevert(record)}
                                            disabled={revertingId === record.id}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                background: 'var(--color-gray-100)',
                                                border: '1px solid var(--color-gray-300)',
                                                color: 'var(--color-gray-700)',
                                                fontWeight: 600,
                                                cursor: revertingId === record.id ? 'not-allowed' : 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                            title="Вернуть старый статус заказа (Откат)"
                                        >
                                            {revertingId === record.id ? 'Возврат...' : 'Откатить'}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
