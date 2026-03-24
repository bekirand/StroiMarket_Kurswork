import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './Support.module.css';

export const metadata: Metadata = {
    title: 'Поддержка | СтройМаркет',
    description: 'Часто задаваемые вопросы, информация о заказах, доставке и возврате товара',
};

function ShoppingBagIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}

function TruckIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    );
}

function RefreshIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <polyline points="23 20 23 14 17 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
    );
}

export default function SupportPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Справочный центр</h1>
                <p className={styles.subtitle}>
                    Здесь мы собрали ответы на самые важные вопросы. <br />
                    Узнайте, как оформить заказ, оплатить его и получить с доставкой до двери.
                </p>
            </div>

            <section id="order" className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                        <ShoppingBagIcon />
                    </div>
                    <h2 className={styles.sectionTitle}>Как сделать заказ</h2>
                </div>
                <div className={styles.content}>
                    <p>Оформление заказа в нашем магазине интуитивно понятно и займет всего пару минут.</p>
                    <ul>
                        <li><strong>Шаг 1.</strong> Перейдите в <Link href="/catalog" style={{ color: 'var(--color-primary-600)' }}>Каталог</Link> товаров и выберите нужные стройматериалы.</li>
                        <li><strong>Шаг 2.</strong> Воспользуйтесь поиском или фильтрами, чтобы быстро найти товар, и нажмите <b>«В корзину»</b>.</li>
                        <li><strong>Шаг 3.</strong> Перейдите в <Link href="/cart" style={{ color: 'var(--color-primary-600)' }}>Корзину</Link>. Проверьте список товаров и при необходимости измените их количество.</li>
                        <li><strong>Шаг 4.</strong> Нажмите <b>«Оформить заказ»</b>. Обратите внимание, что для оформления нужно быть зарегистрированным пользователем. Если у вас нет аккаунта — регистрация быстрая и бесплатная.</li>
                        <li><strong>Шаг 5.</strong> Заполните контактные данные, выберите сохраненный адрес доставки (или добавьте новый), способ получения и нажмите кнопку подтверждения.</li>
                    </ul>
                    <p>После этого ваш заказ сразу поступит в обработку, а отследить его статус можно будет в Личном кабинете.</p>
                </div>
            </section>

            <section id="delivery" className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                        <TruckIcon />
                    </div>
                    <h2 className={styles.sectionTitle}>Доставка и оплата</h2>
                </div>
                <div className={styles.content}>
                    <h3>Способы получения товара</h3>
                    <ul>
                        <li><strong>Курьерская доставка.</strong> Мы доставляем заказы прямо до вашей двери собственным автопарком. Время и дата доставки согласовываются с менеджером после подтверждения.</li>
                        <li><strong>Самовывоз со склада.</strong> Вы можете самостоятельно забрать товар из наших пунктов выдачи. Выберите этот пункт при оформлении.</li>
                    </ul>

                    <h3>Стоимость доставки</h3>
                    <p>Стоимость зависит от зоны доставки и габаритов товара. Точная сумма рассчитывается автоматически или обсуждается менеджером индивидуально при крупногабаритных или оптовых поставках стройматериалов.</p>

                    <h3>Варианты оплаты</h3>
                    <p>На данный момент СтройМаркет поддерживает оплату при получении заказа — вы можете расплатиться наличными курьеру или картой через мобильный терминал после полной проверки качества привезенного товара.</p>
                </div>
            </section>

            <section id="return" className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                        <RefreshIcon />
                    </div>
                    <h2 className={styles.sectionTitle}>Возврат товара</h2>
                </div>
                <div className={styles.content}>
                    <p>Покупка стройматериалов — это ответственный процесс, и мы всегда идем навстречу нашим клиентам. Если заказанный товар вам не подошел или вы рассчитали количество с избытком, вы вправе оформить возврат.</p>

                    <h3>Условия возврата:</h3>
                    <ul>
                        <li>Возврат качественного товара возможен <strong>в течение 14 дней</strong> с момента покупки, если товар не был в использовании, сохранены его товарный вид, потребительские свойства, заводские ярлыки и упаковка.</li>
                        <li>При обнаружении заводского брака товара мы произведем обмен или полный возврат средств по вашему заявлению без лишних вопросов.</li>
                        <li>Товары, отпускаемые на метраж (кабели, пленки и т.д.), а также заколерованная краска возврату и обмену не подлежат согласно законодательству РФ.</li>
                    </ul>

                    <h3>Куда обращаться?</h3>
                    <p>Для оформления возврата свяжитесь с поддержкой через форму обратной связи или позвоните нам. Также вы можете самостоятельно вернуть товар на наш главный склад, имея при себе чек.</p>
                </div>
            </section>

            <div className={styles.contactBanner}>
                <h2>Остались вопросы?</h2>
                <p>Наша служба поддержки всегда готова помочь вам и проконсультировать по любому товару.</p>
                <Link href="/contacts" className={styles.contactBtn}>
                    Написать в поддержку
                </Link>
            </div>
        </div>
    );
}
