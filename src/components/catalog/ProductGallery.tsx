'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Если фото нет
    if (!images || images.length === 0) {
        return (
            <div className={styles.noImageBox}>
                <span className={styles.emptyIcon}>📦</span>
                <p>Фото скоро появится</p>
            </div>
        );
    }

    const nextImage = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const currentImage = images[activeIndex] || images[0];

    return (
        <div className={styles.container}>
            {/* Сайдбар с миниатюрами (слева) */}
            {images.length > 1 && (
                <div className={styles.sidebar}>
                    {images.map((img, i) => (
                        <button
                            key={i}
                            className={`${styles.thumbWrapper} ${i === activeIndex ? styles.active : ''}`}
                            onClick={() => setActiveIndex(i)}
                            onMouseEnter={() => setActiveIndex(i)} // Переключение при наведении
                            aria-label={`Просмотр фото ${i + 1}`}
                        >
                            <Image
                                src={img}
                                alt={`${name} ${i + 1}`}
                                fill
                                sizes="80px"
                                className={styles.thumbnail}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Основное изображение */}
            <div className={styles.mainDisplay}>
                <div
                    className={styles.mainImageWrapper}
                    onClick={() => setIsModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                    title="Нажмите, чтобы увеличить"
                >
                    <Image
                        src={currentImage}
                        alt={name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 600px"
                        className={styles.mainImage}
                    />

                    {/* Стрелки навигации */}
                    {images.length > 1 && (
                        <>
                            <button
                                className={`${styles.navButton} ${styles.prev}`}
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); prevImage(); }}
                                aria-label="Предыдущее фото"
                            >
                                ‹
                            </button>
                            <button
                                className={`${styles.navButton} ${styles.next}`}
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); nextImage(); }}
                                aria-label="Следующее фото"
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Модальное окно (Lightbox) */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>

                    <button
                        className={styles.modalCloseButton}
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                        aria-label="Закрыть галерею"
                    >
                        ×
                    </button>

                    {/* Навигация в модальном окне */}
                    {images.length > 1 && (
                        <>
                            <div className={`${styles.navAreaFixed} ${styles.navAreaLeft}`} onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                                <button className={styles.modalNavButton} aria-label="Предыдущее фото">‹</button>
                            </div>
                            <div className={`${styles.navAreaFixed} ${styles.navAreaRight}`} onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                                <button className={styles.modalNavButton} aria-label="Следующее фото">›</button>
                            </div>
                        </>
                    )}

                    <img
                        src={currentImage}
                        alt={name}
                        className={styles.modalImageNative}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Индикатор фото */}
                    {images.length > 1 && (
                        <div className={styles.modalCounter} onClick={(e) => e.stopPropagation()}>
                            {activeIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
