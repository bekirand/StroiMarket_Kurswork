'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import ProfileTab from './ProfileTab';
import AddressesTab from './AddressesTab';

export default function AccountClient({ user, orders, initialAddresses }: any) {
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

    // Статусы заявок на русском (для бейджей)
    const STATUS_MAP: any = {
        NOVIY: { label: 'Новый', color: '#3b82f6', bg: '#eff6ff' },
        PODTVERZHDEN: { label: 'Подтверждён', color: '#8b5cf6', bg: '#f5f3ff' },
        V_OBRABOTKE: { label: 'В обработке', color: '#f59e0b', bg: '#fffbeb' },
        OTPRAVLEN: { label: 'Отправлен', color: '#06b6d4', bg: '#ecfeff' },
        DOSTAVLEN: { label: 'Доставлен ✓', color: '#10b981', bg: '#ecfdf5' },
        OTMENEN: { label: 'Отменён ✕', color: '#ef4444', bg: '#fef2f2' },
    };

    return (
        <div style={{ padding: '40px 0 80px', backgroundColor: 'var(--color-bg)' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Личный кабинет</h1>
                    <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1.5px solid var(--color-border)',
                        background: 'white', color: 'var(--color-gray-700)', cursor: 'pointer',
                        fontWeight: 600, fontFamily: 'var(--font-family)', transition: 'background 0.2s'
                    }}>
                        Выйти ➔
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '32px', alignItems: 'start' }}>

                    {/* Боковое меню */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-bg-subtle)' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, overflow: 'hidden' }}>
                                {user?.image ? (
                                    <img src={user.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user?.name?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{user?.name}</h2>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>{user?.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'profile' ? 'var(--color-primary-50)' : 'transparent', color: activeTab === 'profile' ? 'var(--color-primary-700)' : 'var(--color-gray-700)', fontWeight: activeTab === 'profile' ? 700 : 500, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <span style={{ marginRight: '8px' }}>👤</span> Мой профиль
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'orders' ? 'var(--color-primary-50)' : 'transparent', color: activeTab === 'orders' ? 'var(--color-primary-700)' : 'var(--color-gray-700)', fontWeight: activeTab === 'orders' ? 700 : 500, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <span style={{ marginRight: '8px' }}>🛍️</span> История заказов ({orders?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'addresses' ? 'var(--color-primary-50)' : 'transparent', color: activeTab === 'addresses' ? 'var(--color-primary-700)' : 'var(--color-gray-700)', fontWeight: activeTab === 'addresses' ? 700 : 500, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <span style={{ marginRight: '8px' }}>📍</span> Адреса доставки
                        </button>

                        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-bg-subtle)' }}>
                            <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', marginBottom: '8px' }}>
                                ROLE: {user?.role}
                            </div>
                            {['ADMIN', 'MANAGER', 'STOREKEEPER'].includes(user?.role || '') && (
                                <Link href="/admin" style={{ display: 'block', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, padding: '10px 16px', background: 'var(--color-primary-600)', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
                                    Панель управления
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Контент вкладок */}
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1.5px solid var(--color-border)', minHeight: '500px' }}>

                        {activeTab === 'profile' && (
                            <ProfileTab user={user} />
                        )}

                        {activeTab === 'addresses' && (
                            <AddressesTab initialAddresses={initialAddresses} />
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Мои заказы</h2>

                                {orders?.length === 0 ? (
                                    <div style={{ background: 'var(--color-bg)', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛍️</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Вы ещё ничего не заказывали</h3>
                                        <p style={{ color: 'var(--color-gray-500)', marginBottom: '20px' }}>Перейдите в каталог, чтобы сделать свой первый заказ.</p>
                                        <Link href="/catalog" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--color-primary-600)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>В каталог</Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {orders?.map((order: any) => (
                                            <div key={order.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Заказ #{order.id}</div>
                                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)' }}>
                                                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-gray-900)' }}>
                                                            {order.totalPrice.toLocaleString('ru-RU')} ₽
                                                        </div>
                                                        <div style={{
                                                            display: 'inline-block', marginTop: '6px',
                                                            padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
                                                            background: STATUS_MAP[order.status]?.bg || '#f1f5f9',
                                                            color: STATUS_MAP[order.status]?.color || '#475569',
                                                        }}>
                                                            {STATUS_MAP[order.status]?.label || order.status}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                            <Link href={`/catalog/${item.product.sku}`} style={{ color: 'var(--color-gray-700)', textDecoration: 'none' }}>
                                                                {item.product.name}
                                                            </Link>
                                                            <div style={{ color: 'var(--color-gray-500)' }}>{item.quantity} шт.</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
