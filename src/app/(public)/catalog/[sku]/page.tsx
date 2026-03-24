/**
 * /catalog/[sku] — Страница конкретного товара
 * Server Component: загружает товар из БД по SKU
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySku, getProducts } from '@/lib/products';
import AddToCartButton from '@/components/catalog/AddToCartButton';
import ProductGallery from '@/components/catalog/ProductGallery';
import ProductReviews from '@/components/catalog/ProductReviews';
import CopyButton from '@/components/ui/CopyButton';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './Product.module.css';

type Params = Promise<{ sku: string }>;

// Генерация метатегов из БД
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { sku } = await params;
    const product = await getProductBySku(sku);
    if (!product) return { title: 'Товар не найден' };
    return {
        title: product.name,
        description: `${product.name} — купить в СтройМаркет. Цена: ${product.price} ₽/${product.unit}.`,
    };
}

export default async function ProductPage({ params }: { params: Params }) {
    const { sku } = await params;
    const product = await getProductBySku(sku);

    if (!product || !product.isActive) notFound();

    const { name, description, price, images, unit, purchaseUnit, stockQuantity, discount, category, reviewCriteria, features, brand } = product;
    const productFeatures = Array.isArray(features) ? features as { name: string, value: string }[] : [];

    const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
    const savings = price - discountedPrice;

    // Похожие товары из той же категории (без текущего)
    const relatedRaw = await getProducts({ categorySlug: category.slug });
    const related = relatedRaw.filter(p => p.sku !== sku).slice(0, 4);

    const session = await auth();
    let canReview = false;
    let cantReviewReason = "Сначала войдите в систему, чтобы оставлять отзывы.";

    if (session?.user?.id) {
        const deliveredOrders = await prisma.order.count({
            where: {
                userId: session.user.id,
                status: 'DOSTAVLEN',
                items: {
                    some: { productId: product.id }
                }
            }
        });

        if (deliveredOrders === 0) {
            cantReviewReason = "Оставлять отзывы могут только покупатели, получившие этот товар.";
        } else {
            const reviewsCount = await prisma.review.count({
                where: {
                    userId: session.user.id,
                    productId: product.id,
                    isDeleted: false
                }
            });

            if (reviewsCount >= deliveredOrders) {
                cantReviewReason = "Вы уже оставили максимальное количество отзывов для ваших покупок этого товара.";
            } else {
                canReview = true;
                cantReviewReason = "";
            }
        }
    }

    return (
        <div style={{ padding: '40px 0 72px' }}>
            <div className="container">

                {/* Хлебные крошки */}
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/">Главная</Link>
                    <span>›</span>
                    <Link href="/catalog">Каталог</Link>
                    <span>›</span>
                    <Link href={`/catalog?category=${category.slug}`}>{category.name}</Link>
                    <span>›</span>
                    <span aria-current="page">{name}</span>
                </nav>

                {/* Основная секция: фото + инфо */}
                <div className={styles.product}>
                    <ProductGallery images={images} name={name} />

                    {/* Информация */}
                    <div className={styles.info}>
                        <div className={styles.catBadge}>{category.name}</div>
                        <h1 className={styles.name}>{name}</h1>
                        <p className={styles.skuLine}>Артикул: <strong>{sku}</strong></p>

                        {/* Цены */}
                        <div className={styles.priceBlock}>
                            <div className={styles.mainPrice}>
                                {discountedPrice.toLocaleString('ru-RU')} ₽
                                <span className={styles.perUnit}>/{unit}</span>
                            </div>
                            {discount > 0 && (
                                <div className={styles.priceDetails}>
                                    <span className={styles.oldPrice}>{price.toLocaleString('ru-RU')} ₽</span>
                                    <span className={styles.saveBadge}>Выгода {savings.toLocaleString('ru-RU')} ₽</span>
                                </div>
                            )}
                        </div>

                        {/* Характеристики */}
                        <div className={styles.attrs}>
                            <div className={styles.attr}>
                                <span className={styles.attrKey}>Единица измерения</span>
                                <span className={styles.attrVal}>{unit}</span>
                            </div>
                            <div className={styles.attr}>
                                <span className={styles.attrKey}>Закупка от</span>
                                <span className={styles.attrVal}>{purchaseUnit}</span>
                            </div>
                            <div className={styles.attr}>
                                <span className={styles.attrKey}>Наличие на складе</span>
                                <span className={`${styles.attrVal} ${stockQuantity > 0 ? styles.green : styles.red}`}>
                                    {stockQuantity > 0 ? `✓ ${stockQuantity} ${unit}` : '✗ Нет в наличии'}
                                </span>
                            </div>
                        </div>

                        {/* Кнопки */}
                        <div className={styles.actions}>
                            <AddToCartButton
                                product={{ id: product.id, sku, name, price: discountedPrice, image: images[0] ?? null, unit }}
                                disabled={stockQuantity === 0}
                            />
                            <Link href="/cart" className={styles.cartLink}>Перейти в корзину →</Link>
                        </div>

                        {/* Описание */}
                        <div className={styles.description}>
                            <h2 className={styles.descTitle}>Описание</h2>
                            <p className={styles.descText}>{description}</p>
                        </div>
                    </div>
                </div>

                {/* Характеристики (Динамические + Статические) */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.featuresTitle}>Характеристики</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureRow}>
                            <span className={styles.featureName}>Артикул</span>
                            <span className={styles.featureDots}></span>
                            <span className={styles.featureValue} style={{ color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {sku}
                                <CopyButton textToCopy={sku} />
                            </span>
                        </div>
                        <div className={styles.featureRow}>
                            <span className={styles.featureName}>Тип</span>
                            <span className={styles.featureDots}></span>
                            <span className={styles.featureValue}>{category.name}</span>
                        </div>
                        {brand && (
                            <div className={styles.featureRow}>
                                <span className={styles.featureName}>Бренд</span>
                                <span className={styles.featureDots}></span>
                                <span className={styles.featureValue} style={{ color: 'var(--color-primary-600)' }}>{brand}</span>
                            </div>
                        )}
                        {productFeatures.map((feat, index) => (
                            <div key={index} className={styles.featureRow}>
                                <span className={styles.featureName}>{feat.name}</span>
                                <span className={styles.featureDots}></span>
                                <span className={styles.featureValue}>{feat.value}</span>
                            </div>
                        ))}
                    </div>
                    <p className={styles.featureDisclaimer}>
                        Информация о технических характеристиках, комплекте поставки, стране изготовления, внешнем виде и цвете товара носит справочный характер и основывается на последних доступных к моменту публикации сведениях.
                    </p>
                </section>

                {/* Похожие товары */}
                {related.length > 0 && (
                    <section style={{ marginTop: '56px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--color-gray-900)' }}>
                            Похожие товары
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {related.map(p => {
                                const img = p.images[0] ?? null;
                                const dp = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
                                return (
                                    <Link key={p.id} href={`/catalog/${p.sku}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                                            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f3f4f6' }}>
                                                {img
                                                    ? <Image src={img} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="220px" />
                                                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>📦</div>
                                                }
                                            </div>
                                            <div style={{ padding: '12px 14px' }}>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '4px' }}>{p.name}</p>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-600)', fontWeight: 700 }}>{dp.toLocaleString('ru-RU')} ₽/{p.unit}</p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Отзывы */}
                <ProductReviews
                    productId={product.id}
                    productSku={sku}
                    rating={product.rating ?? 0}
                    count={product.reviewsCount ?? 0}
                    reviewCriteria={reviewCriteria as { name: string, options: string[] }[] | undefined}
                    canReview={canReview}
                    cantReviewReason={cantReviewReason}
                />
            </div>
        </div>
    );
}
