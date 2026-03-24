/**
 * WhyUsSection — секция «Почему мы?»
 * Серверный компонент
 */
import styles from './WhyUsSection.module.css';

const WHY_US = [
    {
        icon: '🏭',
        title: 'Прямые поставки',
        desc: 'Работаем напрямую с заводами-производителями. Никаких посредников — только актуальные цены.',
    },
    {
        icon: '📋',
        title: 'Сертифицированные товары',
        desc: 'Все материалы имеют сертификаты соответствия ГОСТ и пожарной безопасности.',
    },
    {
        icon: '🚛',
        title: 'Собственный парк техники',
        desc: 'Точечная доставка манипулятором прямо на объект. Работаем по городу и области.',
    },
    {
        icon: '👷',
        title: 'Профессиональные консультации',
        desc: 'Технологи с опытом 10+ лет помогут рассчитать нужное количество материалов.',
    },
    {
        icon: '💳',
        title: 'Оплата по счёту',
        desc: 'Работаем с юрлицами и ИП. Оплата по безналу, рассрочка для постоянных клиентов.',
    },
    {
        icon: '📦',
        title: 'Всегда в наличии',
        desc: 'Склад 3 000 м² позволяет держать весь ассортимент постоянно в наличии.',
    },
];

export default function WhyUsSection() {
    return (
        <section style={{ padding: '72px 0', background: 'var(--color-bg)' }}>
            <div className="container">
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800,
                        color: 'var(--color-gray-900)', marginBottom: '8px',
                    }}>
                        Почему выбирают нас?
                    </h2>
                    <p style={{ color: 'var(--color-gray-500)', fontSize: '1rem' }}>
                        14 лет надёжной работы на строительном рынке
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                }}>
                    {WHY_US.map(({ icon, title, desc }) => (
                        <div key={title} className={styles.whyCard}>
                            <div className={styles.whyIcon} aria-hidden="true">{icon}</div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-gray-900)', marginBottom: '6px' }}>
                                    {title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', lineHeight: 1.65 }}>
                                    {desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
