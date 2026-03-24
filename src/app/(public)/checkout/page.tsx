'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Checkout.module.css';

type DeliveryType = 'DELIVERY' | 'PICKUP';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, totalItems, clearCart } = useCart();

    // Поля формы
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
    const [address, setAddress] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<string>('NEW'); // 'NEW' for manual input
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [comment, setComment] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Форматирование телефона
    const formatPhoneNumber = (value: string) => {
        if (!value) return '';
        const phoneNumber = value.replace(/[^\d]/g, '');
        if (!phoneNumber) return '';

        if (['7', '8', '9'].includes(phoneNumber[0])) {
            const isNine = phoneNumber[0] === '9';
            const prefix = isNine ? '7' : phoneNumber[0];
            let res = prefix === '8' ? '8' : '+7';

            const firstPart = isNine ? phoneNumber : phoneNumber.substring(1);
            if (firstPart.length === 0) return res + ' ';

            res += ' (' + firstPart.substring(0, 3);
            if (firstPart.length >= 4) {
                res += ') ' + firstPart.substring(3, 6);
            }
            if (firstPart.length >= 7) {
                res += '-' + firstPart.substring(6, 8);
            }
            if (firstPart.length >= 9) {
                res += '-' + firstPart.substring(8, 10);
            }
            return res;
        } else {
            return '+' + phoneNumber.substring(0, 15);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value));
    };

    const { data: session, status } = useSession();

    // Автозаполнение полей и загрузка адресов
    useEffect(() => {
        if (session?.user) {
            if (!name && session.user.name) setName(session.user.name);
            if (!email && session.user.email) setEmail(session.user.email);

            // Загрузка полного профиля и адресов
            Promise.all([
                fetch('/api/user/profile').then(res => res.json()),
                fetch('/api/user/addresses').then(res => res.json())
            ]).then(([profileData, addressesData]) => {
                if (profileData.user?.phone && !phone) {
                    setPhone(profileData.user.phone);
                }
                if (addressesData.addresses?.length > 0) {
                    setSavedAddresses(addressesData.addresses);
                    const defaultAddr = addressesData.addresses.find((a: any) => a.isDefault);
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr.id);
                    }
                }
            }).catch(console.error);
        }
    }, [session]);

    // Пустая корзина
    if (items.length === 0) {
        return (
            <div className={styles.page}>
                <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Корзина пуста</h1>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                        Добавьте товары из каталога перед оформлением заказа
                    </p>
                    <Link href="/catalog" style={{
                        display: 'inline-block', padding: '12px 28px',
                        background: 'var(--color-primary-600)', color: 'white',
                        borderRadius: '12px', fontWeight: 600, textDecoration: 'none',
                        fontFamily: 'var(--font-family)',
                    }}>Перейти в каталог</Link>
                </div>
            </div>
        );
    }

    if (status === 'loading') {
        return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Загрузка профиля...</div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className={styles.page}>
                <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Требуется авторизация</h1>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                        Оформление заказа доступно только для зарегистрированных пользователей.
                    </p>
                    <Link href="/login?callbackUrl=/checkout" style={{
                        display: 'inline-block', padding: '12px 28px',
                        background: 'var(--color-primary-600)', color: 'white',
                        borderRadius: '12px', fontWeight: 600, textDecoration: 'none',
                        fontFamily: 'var(--font-family)',
                    }}>Войти в аккаунт</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const phoneDigits = phone.replace(/[^\d]/g, '');
        if (phoneDigits.length < 11 && (phoneDigits[0] === '7' || phoneDigits[0] === '8')) {
            setError('Пожалуйста, введите номер телефона полностью');
            setLoading(false);
            return;
        } else if (phoneDigits.length < 10) {
            setError('Слишком короткий номер телефона');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, phone, email,
                    deliveryType,
                    address: deliveryType === 'DELIVERY'
                        ? (selectedAddressId === 'NEW'
                            ? address
                            : savedAddresses.find((a: any) => a.id === selectedAddressId)?.addressLine)
                        : undefined,
                    comment,
                    items: items.map(i => ({
                        productId: i.productId,
                        sku: i.sku,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                        unit: i.unit,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Ошибка при создании заказа');
                return;
            }

            clearCart();
            router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`);
        } catch {
            setError('Сетевая ошибка. Попробуйте ещё раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>Оформление заказа</h1>

                <div className={styles.layout}>
                    {/* Форма */}
                    <form className={styles.form} onSubmit={handleSubmit}>

                        {/* Контактные данные */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>📋 Контактные данные</h2>
                            <div className={styles.fields}>
                                <div className={styles.row}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Имя *</label>
                                        <input
                                            className={styles.input} type="text"
                                            placeholder="Иван Иванов" required
                                            value={name} onChange={e => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Телефон *</label>
                                        <input
                                            className={styles.input} type="tel"
                                            placeholder="+7 (999) 000-00-00" required
                                            value={phone} onChange={handlePhoneChange}
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Email (необязательно)</label>
                                    <input
                                        className={styles.input} type="email"
                                        placeholder="ivan@example.com"
                                        value={email} onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Доставка */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>🚚 Способ получения</h2>
                            <div className={styles.deliveryOptions}>
                                <label className={styles.deliveryOption}>
                                    <input
                                        type="radio" name="delivery"
                                        value="DELIVERY" checked={deliveryType === 'DELIVERY'}
                                        onChange={() => setDeliveryType('DELIVERY')}
                                    />
                                    <span className={styles.deliveryLabel}>
                                        <span className={styles.deliveryName}>Доставка</span>
                                        <span className={styles.deliveryNote}>До вашего адреса</span>
                                    </span>
                                </label>
                                <label className={styles.deliveryOption}>
                                    <input
                                        type="radio" name="delivery"
                                        value="PICKUP" checked={deliveryType === 'PICKUP'}
                                        onChange={() => setDeliveryType('PICKUP')}
                                    />
                                    <span className={styles.deliveryLabel}>
                                        <span className={styles.deliveryName}>Самовывоз</span>
                                        <span className={styles.deliveryNote}>Со склада бесплатно</span>
                                    </span>
                                </label>
                            </div>

                            {deliveryType === 'DELIVERY' && (
                                <div style={{ marginTop: 24 }}>

                                    {savedAddresses.length > 0 && (
                                        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Куда доставить?</h3>

                                            {savedAddresses.map((addr) => (
                                                <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: `1.5px solid ${selectedAddressId === addr.id ? 'var(--color-primary-500)' : 'var(--color-border)'}`, borderRadius: '12px', cursor: 'pointer', background: selectedAddressId === addr.id ? 'var(--color-primary-50)' : 'white', transition: 'all 0.2s' }}>
                                                    <input
                                                        type="radio"
                                                        name="savedAddress"
                                                        checked={selectedAddressId === addr.id}
                                                        onChange={() => setSelectedAddressId(addr.id)}
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                                                            {addr.title}
                                                            {addr.isDefault && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', padding: '2px 6px', borderRadius: '4px' }}>ОСНОВНОЙ</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)' }}>
                                                            {addr.addressLine}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}

                                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `1.5px solid ${selectedAddressId === 'NEW' ? 'var(--color-primary-500)' : 'var(--color-border)'}`, borderRadius: '12px', cursor: 'pointer', background: selectedAddressId === 'NEW' ? 'var(--color-primary-50)' : 'white', transition: 'all 0.2s' }}>
                                                <input
                                                    type="radio"
                                                    name="savedAddress"
                                                    checked={selectedAddressId === 'NEW'}
                                                    onChange={() => setSelectedAddressId('NEW')}
                                                />
                                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Другой адрес...</span>
                                            </label>
                                        </div>
                                    )}

                                    {selectedAddressId === 'NEW' && (
                                        <div className={styles.field} style={{ marginTop: 14 }}>
                                            <label className={styles.label}>Адрес доставки *</label>
                                            <input
                                                className={styles.input} type="text"
                                                placeholder="Улица, дом, квартира" required
                                                value={address} onChange={e => setAddress(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Комментарий */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>💬 Комментарий к заказу</h2>
                            <textarea
                                className={styles.textarea}
                                placeholder="Пожелания, уточнения по заказу..."
                                value={comment} onChange={e => setComment(e.target.value)}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Оформляем...' : `Оформить заказ — ${totalPrice.toLocaleString('ru-RU')} ₽`}
                        </button>
                    </form>

                    {/* Сводка */}
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Ваш заказ</h2>
                        <div className={styles.summaryItems}>
                            {items.map(item => (
                                <div key={item.productId} className={styles.summaryItem}>
                                    <span className={styles.summaryItemName}>{item.name}</span>
                                    <span className={styles.summaryItemQty}>×{item.quantity}</span>
                                    <span className={styles.summaryItemPrice}>
                                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                    </span>
                                </div>
                            ))}
                        </div>
                        <hr className={styles.summaryDivider} />
                        <div className={styles.summaryTotal}>
                            <span>Итого ({totalItems})</span>
                            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <Link href="/cart" style={{
                            display: 'block', textAlign: 'center',
                            fontSize: '0.8rem', color: 'var(--color-gray-400)',
                            textDecoration: 'none', fontFamily: 'var(--font-family)',
                        }}>
                            ← Изменить корзину
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
