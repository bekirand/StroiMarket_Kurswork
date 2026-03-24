'use client';

/**
 * AddToCartButton — кнопка «В корзину»
 * Client Component — использует useCart() хук
 */
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './AddToCartButton.module.css';

interface Props {
    product: {
        id: string;
        sku: string;
        name: string;
        price: number;
        image: string | null;
        unit: string;
    };
    disabled?: boolean;
    simple?: boolean;
}

export default function AddToCartButton({ product, disabled, simple = false }: Props) {
    const { addItem, items, updateQuantity } = useCart();
    const [added, setAdded] = useState(false);

    const cartItem = items.find(i => i.productId === product.id);
    const quantity = cartItem?.quantity || 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        addItem({
            productId: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            image: product.image,
            unit: product.unit,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, quantity + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, quantity - 1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        if (valStr.length > 5) return; // Ограничение в 5 символов

        const val = parseInt(valStr);
        if (!isNaN(val)) {
            updateQuantity(product.id, val);
        }
    };

    if (disabled) {
        return (
            <button className={`${styles.btn} ${styles.disabled}`} disabled>
                Нет в наличии
            </button>
        );
    }

    if (quantity > 0) {
        if (simple) {
            return (
                <Link
                    href="/cart"
                    className={`${styles.btn} ${styles.added}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    ✓ В корзине
                </Link>
            );
        }

        return (
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.selector}>
                    <button className={styles.stepBtn} onClick={handleDecrement}>−</button>
                    <input
                        type="number"
                        className={styles.input}
                        value={quantity}
                        onChange={handleInputChange}
                        min="1"
                        max="99999"
                    />
                    <button className={styles.stepBtn} onClick={handleIncrement}>+</button>
                </div>
                <Link href="/cart" className={`${styles.btn} ${styles.goCart}`}>
                    Корзина
                </Link>
            </div>
        );
    }

    return (
        <button
            className={`${styles.btn} ${added ? styles.added : styles.default}`}
            onClick={handleAdd}
            aria-label={`Добавить ${product.name} в корзину`}
        >
            {added ? '✓ Добавлено!' : (
                <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    В корзину
                </>
            )}
        </button>
    );
}
