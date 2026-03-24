import type { Metadata } from 'next';
import FavoritesClient from './FavoritesClient';
import styles from '../catalog/Catalog.module.css';

export const metadata: Metadata = {
    title: 'Избранное',
    description: 'Ваши сохраненные товары.',
};

export default function FavoritesPage() {
    return (
        <div className={styles.page}>
            <div className="container" style={{ minHeight: '60vh' }}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Моё Избранное</h1>
                    <p className={styles.subtitle}>
                        Товары, которые вы добавили в закладки
                    </p>
                </div>

                <FavoritesClient />
            </div>
        </div>
    );
}
