'use client';

/**
 * AnimatedCounters — блок с анимированными счётчиками
 * Запускают анимацию при первом появлении в вьюпорте (IntersectionObserver)
 */
import { useEffect, useRef, useState } from 'react';

interface CounterProps {
    end: number;
    suffix?: string;
    duration?: number; // мс
}

function Counter({ end, suffix = '', duration = 1800 }: CounterProps) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const startTime = performance.now();
                    const step = (timestamp: number) => {
                        const elapsed = timestamp - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // easeOutExpo: плавное замедление в конце
                        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                        setValue(Math.floor(eased * end));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [end, duration]);

    return (
        <span ref={ref}>
            {value.toLocaleString('ru-RU')}{suffix}
        </span>
    );
}

const COUNTERS = [
    { value: 500, suffix: '+', label: 'Товаров в каталоге', icon: '📦' },
    { value: 5, suffix: '', label: 'Категорий материалов', icon: '🗂️' },
    { value: 1200, suffix: '+', label: 'Довольных клиентов', icon: '😊' },
    { value: 14, suffix: '', label: 'Лет на рынке', icon: '🏆' },
];

export default function AnimatedCounters() {
    return (
        <section style={{ background: 'var(--color-primary-600)', padding: '56px 0' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '32px',
                    textAlign: 'center',
                }}>
                    {COUNTERS.map(({ value, suffix, label, icon }) => (
                        <div key={label}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                color: 'white',
                                lineHeight: 1,
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                <Counter end={value} suffix={suffix} />
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255,255,255,0.72)',
                                marginTop: '8px',
                                fontWeight: 500,
                            }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
