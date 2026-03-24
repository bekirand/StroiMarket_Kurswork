'use client';

/**
 * /cart — Страница корзины
 * Client Component: использует CartContext
 */
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import styles from './Cart.module.css';

export default function CartPage() {
    const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
    const { data: session } = useSession();

    const handleInputChange = (productId: string, val: string) => {
        if (val.length > 5) return; // Ограничение в 5 символов
        const parsed = parseInt(val);
        if (!isNaN(parsed) && parsed > 0) {
            updateQuantity(productId, parsed);
        }
    };

    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🛒</div>
                <h1 className={styles.emptyTitle}>Корзина пуста</h1>
                <p className={styles.emptyText}>Добавьте товары из каталога, чтобы оформить заказ</p>
                <Link href="/catalog" className={styles.btnPrimary}>Перейти в каталог</Link>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>Корзина <span className={styles.count}>({totalItems})</span></h1>

                <div className={styles.layout}>
                    {/* Список товаров */}
                    <div className={styles.items}>
                        {items.map(item => (
                            <div key={item.productId} className={styles.item}>
                                {/* Фото */}
                                <div className={styles.itemImage}>
                                    {item.image
                                        ? <Image src={item.image} alt={item.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem' }}>📦</div>
                                    }
                                </div>

                                {/* Название и артикул */}
                                <div className={styles.itemInfo}>
                                    <Link href={`/catalog/${item.sku}`} className={styles.itemName}>{item.name}</Link>
                                    <span className={styles.itemSku}>Арт. {item.sku} · {item.unit}</span>
                                </div>

                                {/* Количество */}
                                <div className={styles.qty}>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        aria-label="Уменьшить"
                                    >−</button>
                                    <input
                                        type="number"
                                        className={styles.qtyInput}
                                        value={item.quantity}
                                        onChange={(e) => handleInputChange(item.productId, e.target.value)}
                                        min="1"
                                        max="99999"
                                    />
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        aria-label="Увеличить"
                                    >+</button>
                                </div>

                                {/* Цена */}
                                <div className={styles.itemPrice}>
                                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                    <span className={styles.itemPricePer}>{item.price.toLocaleString('ru-RU')} ₽/{item.unit}</span>
                                </div>

                                {/* Удалить */}
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeItem(item.productId)}
                                    aria-label="Удалить товар"
                                >✕</button>
                            </div>
                        ))}

                        <button onClick={clearCart} className={styles.clearBtn}>
                            Очистить корзину
                        </button>
                    </div>

                    {/* Итог */}
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Итого</h2>

                        <div className={styles.summaryRow}>
                            <span>Товаров</span>
                            <span>{totalItems} шт.</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Сумма</span>
                            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                            <span>К оплате</span>
                            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                        </div>

                        {session ? (
                            <Link href="/checkout" className={styles.checkoutBtn}>
                                Оформить заказ →
                            </Link>
                        ) : (
                            <Link href="/login?callbackUrl=/checkout" className={styles.checkoutBtn} style={{ background: 'var(--color-gray-800)' }}>
                                Войти для оформления →
                            </Link>
                        )}

                        <Link href="/catalog" className={styles.continueBtn}>
                            ← Продолжить покупки
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
