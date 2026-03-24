'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

type ChartDataPoint = {
    label: string;
    revenue: number;
    orders: number;
};

type AnalyticsData = {
    chartData: ChartDataPoint[];
    summary: {
        totalRevenue: number;
        totalOrders: number;
        averageTicket: number;
    };
    hasReset: boolean;
};

export default function AnalyticsClient({ isAdmin }: { isAdmin: boolean }) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const [year, setYear] = useState<number | 'ALL'>(currentYear);
    const [month, setMonth] = useState<number | null>(currentMonth);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        fetchData(year, month);
    }, [year, month]);

    const fetchData = async (y: number | 'ALL', m: number | null) => {
        setLoading(true);
        try {
            const url = `/api/admin/analytics?year=${y}${m && y !== 'ALL' ? `&month=${m}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch stats');
            const json: AnalyticsData = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Вы уверены, что хотите сбросить статистику за этот период? Старые заказы перестанут учитываться на графиках.')) {
            return;
        }
        setIsResetting(true);
        try {
            const res = await fetch('/api/admin/analytics/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year, month })
            });
            if (res.ok) {
                await fetchData(year, month);
            } else {
                alert('Ошибка при сбросе статистики');
            }
        } finally {
            setIsResetting(false);
        }
    };

    const handleUndoReset = async () => {
        if (!confirm('Отменить сброс? Данные за весь период снова появятся на графиках.')) {
            return;
        }
        setIsResetting(true);
        try {
            const res = await fetch(`/api/admin/analytics/reset?year=${year}&month=${month === null ? 'null' : month}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchData(year, month);
            } else {
                alert('Ошибка при отмене сброса');
            }
        } finally {
            setIsResetting(false);
        }
    };

    const monthsOptions = [
        { val: 1, label: 'Январь' }, { val: 2, label: 'Февраль' }, { val: 3, label: 'Март' },
        { val: 4, label: 'Апрель' }, { val: 5, label: 'Май' }, { val: 6, label: 'Июнь' },
        { val: 7, label: 'Июль' }, { val: 8, label: 'Август' }, { val: 9, label: 'Сентябрь' },
        { val: 10, label: 'Октябрь' }, { val: 11, label: 'Ноябрь' }, { val: 12, label: 'Декабрь' }
    ];

    const generateYears = () => {
        const years = [];
        for (let y = 2023; y <= currentYear + 1; y++) {
            years.push(y);
        }
        return years;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Навигация */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Год
                    </label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', background: 'white', cursor: 'pointer' }}
                    >
                        <option value="ALL">За все года</option>
                        {generateYears().map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                        Месяц
                    </label>
                    <select
                        value={month === null ? 'ALL' : month}
                        onChange={(e) => setMonth(e.target.value === 'ALL' ? null : Number(e.target.value))}
                        disabled={year === 'ALL'}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', background: year === 'ALL' ? '#f8fafc' : 'white', cursor: year === 'ALL' ? 'not-allowed' : 'pointer', opacity: year === 'ALL' ? 0.6 : 1 }}
                    >
                        <option value="ALL">Весь год (по месяцам)</option>
                        {monthsOptions.map(m => (
                            <option key={m.val} value={m.val}>{m.label}</option>
                        ))}
                    </select>
                </div>

                {isAdmin && data && year !== 'ALL' && (
                    <div style={{ flex: '0 0 auto', alignSelf: 'flex-end', marginLeft: 'auto' }}>
                        {data.hasReset ? (
                            <button
                                onClick={handleUndoReset}
                                disabled={isResetting}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #10b981', background: 'white', color: '#10b981', fontWeight: 600, cursor: isResetting ? 'not-allowed' : 'pointer', height: '42px', transition: 'all 0.2s'
                                }}
                            >
                                {isResetting ? 'Обработка...' : 'Отменить сброс (Undo)'}
                            </button>
                        ) : (
                            <button
                                onClick={handleReset}
                                disabled={isResetting}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, cursor: isResetting ? 'not-allowed' : 'pointer', height: '42px', transition: 'all 0.2s'
                                }}
                            >
                                {isResetting ? 'Сброс...' : 'Сбросить статистику'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Карточки Итого */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)', fontWeight: 600, marginBottom: '8px' }}>Общая выручка</span>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
                        {loading ? '...' : (data?.summary.totalRevenue || 0).toLocaleString('ru-RU')} ₽
                    </span>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)', fontWeight: 600, marginBottom: '8px' }}>Количество заказов</span>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                        {loading ? '...' : (data?.summary.totalOrders || 0)} шт
                    </span>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)', fontWeight: 600, marginBottom: '8px' }}>Средний чек</span>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
                        {loading ? '...' : Math.round(data?.summary.averageTicket || 0).toLocaleString('ru-RU')} ₽
                    </span>
                </div>
            </div>

            {/* Графики */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>Выручка ({year === 'ALL' ? 'По годам' : month === null ? 'По месяцам' : 'По дням'})</h3>
                    <div style={{ width: '100%', height: '350px' }}>
                        {loading ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-500)' }}>Загрузка данных...</div>
                        ) : data?.chartData && data.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Выручка']}
                                    />
                                    <Bar dataKey="revenue" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-500)' }}>Нет данных</div>
                        )}
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>Заказы ({year === 'ALL' ? 'По годам' : month === null ? 'По месяцам' : 'По дням'})</h3>
                    <div style={{ width: '100%', height: '350px' }}>
                        {loading ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-500)' }}>Загрузка данных...</div>
                        ) : data?.chartData && data.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`${value} шт`, 'Заказы']}
                                    />
                                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-500)' }}>Нет данных</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
