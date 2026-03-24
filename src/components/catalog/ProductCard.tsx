/**
 * ProductCard — карточка товара в каталоге
 * Серверный компонент: статичные данные.
 * Кнопка «В корзину» — клиентский Subcomponent.
 */
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';
import AddToCartButton from './AddToCartButton';
import FavoriteButton from '../product/FavoriteButton';

// Тип совпадает с возвращаемым из getProducts()
interface Props {
    product: {
        id: string;
        sku: string;
        name: string;
        price: number;
        images: string[];
        unit: string;
        discount: number;
        stockQuantity: number;
        category: { name: string; slug: string };
        rating?: number;
        reviewsCount?: number;
    };
}

/** Иконка-заглушка по категории */
function CategoryIcon({ slug }: { slug: string }) {
    const icons: Record<string, string> = {
        'lakokrasochnye': '🎨',
        'kirpich-i-bloki': '🧱',
        'cement-i-smesi': '🪣',
        'instrumenty': '🔨',
        'krovlya-i-fasad': '🏠',
    };
    return <>{icons[slug] ?? '📦'}</>;
}

export default function ProductCard({ product }: Props) {
    const { id, sku, name, price, images, unit, discount, stockQuantity, category, rating, reviewsCount } = product;

    // Рассчитываем цену со скидкой
    const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
    const firstImage = images && images.length > 0 ? images[0] : null;
    const inStock = stockQuantity > 0;

    return (
        <article className={styles.card} data-product-card>
            {/* Ссылка на страницу товара */}
            <Link href={`/catalog/${sku}`} className={styles.imageWrap} aria-label={name}>
                {firstImage ? (
                    <Image
                        src={firstImage}
                        alt={name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <CategoryIcon slug={category.slug} />
                    </div>
                )}
                {discount > 0 && (
                    <span className={styles.discountBadge}>−{discount}%</span>
                )}
            </Link>

            <FavoriteButton productId={id} />

            {/* Тело карточки */}
            <Link href={`/catalog/${sku}`} className={styles.body}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span className={styles.category}>{category.name}</span>
                    {rating !== undefined && reviewsCount !== undefined && reviewsCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>{rating.toFixed(1)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>({reviewsCount})</span>
                        </div>
                    )}
                </div>
                <h3 className={styles.name}>{name}</h3>

                <div className={styles.priceRow}>
                    <span className={styles.price}>
                        {discountedPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    {discount > 0 && (
                        <span className={styles.oldPrice}>
                            {price.toLocaleString('ru-RU')} ₽
                        </span>
                    )}
                    <span className={styles.unit}>/ {unit}</span>
                </div>
            </Link>

            {/* Кнопка и наличие */}
            <div className={styles.footer}>
                <span className={`${styles.stock} ${inStock ? styles.inStock : styles.outStock}`}>
                    {inStock ? `✓ В наличии (${stockQuantity})` : '✗ Нет в наличии'}
                </span>
                <AddToCartButton
                    product={{
                        id,
                        sku,
                        name,
                        price: discountedPrice,
                        image: firstImage,
                        unit
                    }}
                    disabled={!inStock}
                    simple={true}
                />
            </div>
        </article>
    );
}
