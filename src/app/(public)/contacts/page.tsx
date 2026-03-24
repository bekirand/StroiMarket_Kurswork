'use client';

/**
 * /contacts — Контакты
 * Клиентский компонент
 */
import { useState } from 'react';

const CONTACTS = [
    { icon: '📞', label: 'Телефон', value: '8 (800) 123-45-67', note: 'Бесплатно по России' },
    { icon: '📧', label: 'Email', value: 'info@stroymarket.ru', note: 'Ответим в течение часа' },
    { icon: '📍', label: 'Адрес', value: 'г. Москва, ул. Строительная, 1', note: 'Склад и офис' },
    { icon: '🕐', label: 'Режим работы', value: 'Пн–Пт 8:00–18:00', note: 'Сб 9:00–16:00, Вс — выходной' },
];

export default function ContactsPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const phoneDigits = phone.replace(/[^\d]/g, '');
        if (phoneDigits.length < 11 && (phoneDigits[0] === '7' || phoneDigits[0] === '8')) {
            setStatus('error');
            setErrorMsg('Пожалуйста, введите номер телефона полностью');
            return;
        } else if (phoneDigits.length < 10) {
            setStatus('error');
            setErrorMsg('Слишком короткий номер телефона');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, message }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Ошибка отправки');
            }

            setStatus('success');
            setName('');
            setPhone('');
            setMessage('');
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message);
        }
    };

    return (
        <div style={{ padding: '40px 0 72px' }}>
            <div className="container">

                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '8px' }}>
                        Контакты
                    </h1>
                    <p style={{ color: 'var(--color-gray-500)' }}>Мы на связи и готовы ответить на любые вопросы</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>

                    {/* Контактная информация */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {CONTACTS.map(c => (
                            <div key={c.label} style={{
                                display: 'flex', gap: '16px', padding: '20px',
                                background: 'white', border: '1.5px solid var(--color-border)',
                                borderRadius: '16px',
                            }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: 'var(--color-primary-50)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
                                }}>{c.icon}</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{c.label}</div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>{c.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>{c.note}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Форма обратной связи */}
                    <div style={{
                        background: 'white', border: '1.5px solid var(--color-border)',
                        borderRadius: '20px', padding: '32px',
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', color: 'var(--color-gray-900)' }}>
                            Написать нам
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {status === 'success' && (
                                <div style={{ padding: '16px', background: 'var(--color-green-50)', color: 'var(--color-green-700)', border: '1px solid var(--color-green-200)', borderRadius: '12px', fontWeight: 600 }}>
                                    ✅ Спасибо! Ваше сообщение успешно отправлено. Мы ответим вам в ближайшее время.
                                </div>
                            )}
                            {status === 'error' && (
                                <div style={{ padding: '16px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '12px', fontWeight: 600 }}>
                                    ❌ {errorMsg}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '6px' }}>
                                    Ваше имя *
                                </label>
                                <input
                                    type="text" placeholder="Иван Иванов" required
                                    value={name} onChange={e => setName(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontFamily: 'var(--font-family)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '6px' }}>
                                    Телефон *
                                </label>
                                <input
                                    type="tel" placeholder="+7 (999) 000-00-00" required
                                    value={phone} onChange={handlePhoneChange}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontFamily: 'var(--font-family)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
                                        Сообщение *
                                    </label>
                                    <span style={{ fontSize: '0.75rem', color: message.length > 900 ? 'var(--color-primary-600)' : 'var(--color-gray-400)', fontWeight: 500 }}>
                                        {message.length} / 1000
                                    </span>
                                </div>
                                <textarea
                                    placeholder="Опишите ваш вопрос..." rows={4} required maxLength={1000}
                                    value={message} onChange={e => setMessage(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontFamily: 'var(--font-family)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <button type="submit" disabled={status === 'loading'} style={{
                                padding: '13px', borderRadius: '12px',
                                background: status === 'loading' ? 'var(--color-gray-400)' : 'var(--color-primary-600)', color: 'white',
                                fontWeight: 700, fontSize: '1rem', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-family)', transition: 'background 0.2s',
                            }}>
                                {status === 'loading' ? 'Отправка...' : 'Отправить сообщение'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Карта (заглушка) */}
                <div style={{ marginTop: '48px', borderRadius: '20px', overflow: 'hidden', height: '300px', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: 'var(--color-gray-400)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🗺️</div>
                        <p>г. Москва, ул. Строительная, 1</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
