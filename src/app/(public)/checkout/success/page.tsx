'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
    const params = useSearchParams();
    const orderNumber = params.get('order') ?? '—';

    return (
        <div style={{
            minHeight: '60vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '60px 20px',
        }}>
            {/* Иконка ✓ */}
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: '#dcfce7', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '24px',
                fontSize: '2.5rem',
            }}>✓</div>

            <h1 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800,
                color: 'var(--color-gray-900)', marginBottom: '12px',
            }}>
                Заказ оформлен!
            </h1>

            <p style={{ color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                Ваш заказ <strong style={{ color: 'var(--color-gray-900)' }}>{orderNumber}</strong> успешно создан.
            </p>
            <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem', marginBottom: '32px', maxWidth: '400px' }}>
                Наш менеджер свяжется с вами в течение рабочего дня для подтверждения деталей.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/" style={{
                    padding: '12px 28px', borderRadius: '12px',
                    background: 'var(--color-primary-600)', color: 'white',
                    fontWeight: 600, textDecoration: 'none',
                    fontFamily: 'var(--font-family)',
                }}>
                    На главную
                </Link>
                <Link href="/catalog" style={{
                    padding: '12px 28px', borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    color: 'var(--color-gray-700)',
                    fontWeight: 500, textDecoration: 'none',
                    fontFamily: 'var(--font-family)',
                }}>
                    Продолжить покупки
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}>Загрузка...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
