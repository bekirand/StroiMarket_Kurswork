'use client';

/**
 * CartContext — глобальный контекст корзины на localStorage
 * Работает без авторизации. После Шага 5 — синхронизация с БД.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ── Типы ────────────────────────────────────────────────
export interface CartItem {
    productId: string;
    sku: string;
    name: string;
    price: number;
    image: string | null;
    unit: string;
    quantity: number;
}

interface CartContextValue {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, qty: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'stroymarket_cart';

// ── Provider ─────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Загружаем корзину из localStorage при первом рендере
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch {
            // ignore
        }
        setHydrated(true);
    }, []);

    // Сохраняем в localStorage при каждом изменении
    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items, hydrated]);

    // ── Методы ──
    const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === newItem.productId);
            if (existing) {
                return prev.map(i =>
                    i.productId === newItem.productId
                        ? { ...i, quantity: i.quantity + qty }
                        : i
                );
            }
            return [...prev, { ...newItem, quantity: qty }];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, qty: number) => {
        if (qty <= 0) {
            setItems(prev => prev.filter(i => i.productId !== productId));
        } else {
            setItems(prev =>
                prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i)
            );
        }
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

// ── Хук ──────────────────────────────────────────────────
export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
    return ctx;
}
