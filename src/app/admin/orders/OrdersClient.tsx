'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@prisma/client';

type OrderWithItems = {
    id: string;
    customerName: string;
    customerPhone: string;
    totalPrice: number;
    status: OrderStatus;
    createdAt: Date;
    items: { quantity: number; product: { name: string; sku: string } }[];
};

const STATUS_MAP = {
    NOVIY: { label: 'Новый', color: '#3b82f6', bg: '#eff6ff' },
    PODTVERZHDEN: { label: 'Подтверждён', color: '#8b5cf6', bg: '#f5f3ff' },
    V_OBRABOTKE: { label: 'В обработке', color: '#f59e0b', bg: '#fffbeb' },
    OTPRAVLEN: { label: 'Отправлен', color: '#06b6d4', bg: '#ecfeff' },
    DOSTAVLEN: { label: 'Доставлен', color: '#10b981', bg: '#ecfdf5' },
    OTMENEN: { label: 'Отменён', color: '#ef4444', bg: '#fef2f2' },
};

export default function OrdersClient({ initialOrders }: { initialOrders: OrderWithItems[] }) {
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Состояния фильтров
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Ошибка при обновлении статуса');
        } finally {
            setUpdatingId(null);
        }
    };

    // Применение фильтров
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 1. Поиск (по ID, Имени, Телефону, Email или названию товара)
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                order.id.toLowerCase().includes(q) ||
                order.customerName.toLowerCase().includes(q) ||
                order.customerPhone.includes(q) ||
                order.items.some(item => item.product.name.toLowerCase().includes(q));

            // 2. Фильтр по дате (ввод текста, ищем частичное совпадение по DD.MM.YYYY или YYYY-MM-DD)
            const dateStr1 = order.createdAt.toLocaleDateString('ru-RU'); // 22.02.2026
            const dateStr2 = order.createdAt.toISOString().split('T')[0]; // 2026-02-22

            const matchesDate = !filterDate ||
                dateStr1.includes(filterDate) ||
                dateStr2.includes(filterDate);

            // 3. Фильтр по статусу
            const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;

            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [orders, searchQuery, filterDate, filterStatus]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Панель фильтров */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Поиск (ID, Клиент, Товар)
                    </label>
                    <input
                        type="text"
                        placeholder="Найти заказ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Дата создания
                    </label>
                    <input
                        type="text"
                        placeholder="ДД.ММ.ГГГГ"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Статус заказа
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.95rem', background: 'white' }}
                    >
                        <option value="ALL">Все статусы</option>
                        {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>
                {(searchQuery || filterDate || filterStatus !== 'ALL') && (
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            onClick={() => { setSearchQuery(''); setFilterDate(''); setFilterStatus('ALL'); }}
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
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>ID / Дата</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Клиент</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Товары</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Сумма</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    Заказов не найдено
                                </td>
                            </tr>
                        ) : filteredOrders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 600 }}>{order.id}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>
                                        {new Date(order.createdAt).toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>{order.customerPhone}</div>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', maxWidth: '300px' }}>
                                                <span style={{ color: 'var(--color-gray-500)', whiteSpace: 'nowrap' }}>{item.quantity} шт.</span>
                                                <Link href={`/catalog/${item.product.sku}`} style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600, wordBreak: 'break-word', lineHeight: '1.4' }}>
                                                    {item.product.name}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: 700 }}>
                                    {order.totalPrice.toLocaleString('ru-RU')} ₽
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                        disabled={updatingId === order.id}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: '1.5px solid var(--color-border)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: STATUS_MAP[order.status]?.bg || 'white',
                                            color: STATUS_MAP[order.status]?.color || 'black',
                                            cursor: 'pointer',
                                            outline: 'none'
                                        }}
                                    >
                                        {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                                            <option key={val} value={val} style={{ background: 'white', color: 'black' }}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
