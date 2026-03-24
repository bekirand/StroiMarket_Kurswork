/**
 * ReviewsSection — секция с отзывами клиентов
 * Серверный компонент, данные статичные
 */
import styles from './ReviewsSection.module.css';



const REVIEWS = [
    {
        text: 'Заказывали кирпич и газобетон для строительства дома. Всё привезли точно в срок, качество отличное. Менеджер помог рассчитать нужное количество материалов.',
        name: 'Алексей Морозов',
        role: 'Частный застройщик',
        initials: 'АМ',
        rating: 5,
    },
    {
        text: 'Регулярно закупаем инструменты и крепёж для нашей бригады. Цены ниже, чем в других магазинах, доставка быстрая. Рекомендую для профессионального использования.',
        name: 'Дмитрий Строителев',
        role: 'Прораб, ООО СтройГрупп',
        initials: 'ДС',
        rating: 5,
    },
    {
        text: 'Покупала краску и шпаклёвку для ремонта квартиры. Сотрудники помогли выбрать нужные материалы, объяснили как правильно применять. Результат превзошёл ожидания!',
        name: 'Мария Иванова',
        role: 'Частный клиент',
        initials: 'МИ',
        rating: 5,
    },
];

export default function ReviewsSection() {
    return (
        <section style={{ padding: '72px 0', background: 'var(--color-bg-muted)' }}>
            <div className="container">
                {/* Заголовок */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800,
                        color: 'var(--color-gray-900)', marginBottom: '8px',
                    }}>
                        Отзывы наших клиентов
                    </h2>
                    <p style={{ color: 'var(--color-gray-500)', fontSize: '1rem' }}>
                        Более 1 200 довольных покупателей
                    </p>
                </div>

                {/* Карточки отзывов */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                }}>
                    {REVIEWS.map((review) => (
                        <div key={review.name} className={styles.reviewCard}>
                            {/* Звёзды */}
                            <div className={styles.stars} aria-label={`Оценка: ${review.rating} из 5`}>
                                {'★'.repeat(review.rating)}
                            </div>

                            {/* Текст отзыва */}
                            <p className={styles.reviewText}>«{review.text}»</p>

                            {/* Автор */}
                            <div className={styles.reviewAuthor}>
                                <div className={styles.reviewAvatar} aria-hidden="true">
                                    {review.initials}
                                </div>
                                <div>
                                    <div className={styles.reviewName}>{review.name}</div>
                                    <div className={styles.reviewRole}>{review.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
