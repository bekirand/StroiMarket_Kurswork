/**
 * /about — О компании
 * Серверный компонент, статичный контент
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'О компании',
    description: 'СтройМаркет — строительные материалы с 2010 года. Прямые поставки от производителей, собственный склад 3 000 м², доставка по городу и области.',
};

const STATS = [
    { value: '14', label: 'лет на рынке' },
    { value: '500+', label: 'товаров' },
    { value: '1 200+', label: 'клиентов' },
    { value: '3 000 м²', label: 'складских площадей' },
];

const TIMELINE = [
    { year: '2010', text: 'Основание компании. Открытие первого склада и начало работы с частными застройщиками.' },
    { year: '2014', text: 'Расширение ассортимента до 200 позиций. Запуск собственного парка доставки.' },
    { year: '2018', text: 'Открытие нового склада площадью 3 000 м². Начало работы с корпоративными клиентами.' },
    { year: '2022', text: 'Переход в онлайн — запуск интернет-магазина с каталогом и онлайн-заказами.' },
    { year: '2024', text: 'Более 1 200 постоянных клиентов, 500+ товаров, доставка в день заказа.' },
];

export default function AboutPage() {
    return (
        <div style={{ padding: '40px 0 72px' }}>
            <div className="container">

                {/* Герой */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
                    borderRadius: '24px', padding: '60px 48px', color: 'white', marginBottom: '64px',
                }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '16px' }}>
                        О компании СтройМаркет
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', maxWidth: '600px', lineHeight: 1.75 }}>
                        С 2010 года мы помогаем строить надёжно и выгодно. Прямые поставки от производителей,
                        профессиональные консультации и доставка в день заказа.
                    </p>
                </div>

                {/* Статистика */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '20px', marginBottom: '64px',
                }}>
                    {STATS.map(s => (
                        <div key={s.label} style={{
                            background: 'white', border: '1.5px solid var(--color-border)',
                            borderRadius: '16px', padding: '24px', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>{s.value}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* История */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '32px', color: 'var(--color-gray-900)' }}>
                        История компании
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {TIMELINE.map((item, i) => (
                            <div key={item.year} style={{ display: 'flex', gap: '24px', paddingBottom: i < TIMELINE.length - 1 ? '32px' : 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: 'var(--color-primary-600)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                                    }}>{item.year}</div>
                                    {i < TIMELINE.length - 1 && (
                                        <div style={{ width: '2px', flex: 1, background: 'var(--color-border)', marginTop: '8px' }} />
                                    )}
                                </div>
                                <div style={{ paddingTop: '12px' }}>
                                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 1.75 }}>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{
                    background: 'var(--color-bg-muted)', borderRadius: '20px', padding: '40px',
                    textAlign: 'center',
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: 'var(--color-gray-900)' }}>
                        Готовы к сотрудничеству?
                    </h2>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                        Свяжитесь с нами или перейдите в каталог
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/contacts" style={{
                            padding: '12px 28px', borderRadius: '12px',
                            background: 'var(--color-primary-600)', color: 'white',
                            fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-family)',
                        }}>Связаться</Link>
                        <Link href="/catalog" style={{
                            padding: '12px 28px', borderRadius: '12px',
                            border: '1.5px solid var(--color-border)', color: 'var(--color-gray-700)',
                            fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-family)',
                        }}>Каталог</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
