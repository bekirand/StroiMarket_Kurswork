'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FavoriteButton.module.css';

let globalFavoritesPromise: Promise<string[]> | null = null;
let globalFavorites: string[] | null = null;

export async function clearFavoritesCache() {
    globalFavorites = null;
    globalFavoritesPromise = null;
}

async function fetchUserFavorites(): Promise<string[]> {
    if (globalFavorites) return globalFavorites;
    if (globalFavoritesPromise) return globalFavoritesPromise;

    globalFavoritesPromise = fetch('/api/favorites')
        .then(res => res.json())
        .then(data => {
            const ids = data.items ? data.items.map((i: any) => i.productId) : [];
            globalFavorites = ids;
            return ids;
        })
        .catch(err => {
            console.error('Failed to fetch favorites', err);
            return [];
        });

    return globalFavoritesPromise;
}

export default function FavoriteButton({ productId, initialIsFavorite }: { productId: string, initialIsFavorite?: boolean }) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false);
    const [isLoading, setIsLoading] = useState(initialIsFavorite === undefined);
    const router = useRouter();

    useEffect(() => {
        if (initialIsFavorite === undefined) {
            fetchUserFavorites().then(ids => {
                setIsFavorite(ids.includes(productId));
                setIsLoading(false);
            });
        }
    }, [productId, initialIsFavorite]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Не переходить в карточку товара

        setIsLoading(true);
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFavorite(data.added);
                clearFavoritesCache(); // Очищаем кеш, чтобы при переходе на другие страницы данные были актуальны
                router.refresh(); // Обновить серверные компоненты (например, бейдж в шапке, если будет)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
            onClick={toggleFavorite}
            disabled={isLoading}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isLoading ? styles.loading : ''}
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
    );
}
