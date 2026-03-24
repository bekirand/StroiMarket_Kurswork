'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './ProductReviews.module.css';

function CustomSelect({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={selectRef} className={styles.customSelectContainer}>
            <div
                className={`${styles.customSelectHeader} ${isOpen ? styles.customSelectHeaderOpen : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? styles.customSelectValue : styles.customSelectPlaceholder}>
                    {value || placeholder}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', minWidth: '16px' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            {isOpen && (
                <div className={styles.customSelectList}>
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            className={`${styles.customSelectOption} ${value === opt ? styles.customSelectOptionSelected : ''}`}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProductReviews({ productId, productSku, rating, count, reviewCriteria = [], canReview = false, cantReviewReason = '' }: { productId: string, productSku: string, rating: number, count: number, reviewCriteria?: { name: string, options: string[] }[], canReview?: boolean, cantReviewReason?: string }) {
    const { data: session } = useSession();
    const router = useRouter();

    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Форма
    const [showForm, setShowForm] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newCriteriaRatings, setNewCriteriaRatings] = useState<Record<string, string>>({});
    const [newText, setNewText] = useState('');
    const [newImages, setNewImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lightbox states
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openLightbox = (images: string[], index: number) => {
        setLightboxImages(images.map(img => img.trim()));
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        if (reviewCriteria && reviewCriteria.length > 0) {
            setNewCriteriaRatings({});
        }
    }, [reviewCriteria]);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch(`/api/reviews?productId=${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валидация кастомных полей
        if (reviewCriteria && reviewCriteria.length > 0) {
            for (const crit of reviewCriteria) {
                if (!newCriteriaRatings[crit.name]) {
                    alert(`Пожалуйста, выберите вариант для критерия "${crit.name}"`);
                    return;
                }
            }
        }

        setIsSubmitting(true);
        try {
            const imagesArray = newImages;

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating: newRating,
                    text: newText,
                    images: imagesArray,
                    criteriaRatings: newCriteriaRatings
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Добавляем созданный отзыв в начало списка
                setReviews([{ ...data.review, user: { name: session?.user?.name || 'Пользователь', image: session?.user?.image || null } }, ...reviews]);
                setNewText('');
                setNewImages([]);
                setNewRating(5);
                setNewCriteriaRatings({});
                setShowForm(false);
                router.refresh(); // Обновить средний рейтинг на сервере
            } else {
                alert('Ошибка при отправке отзыва');
            }
        } catch (error) {
            console.error(error);
            alert('Сбой сети при отправке отзыва');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (newImages.length + uploadedUrls.length + 1 > 4) {
                    alert('Максимум 4 фотографии');
                    break;
                }

                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('folder', `/products/${productSku}/reviews/${session?.user?.name || 'anonymous'}`);

                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!res.ok) throw new Error('Ошибка загрузки файла');
                const data = await res.json();
                uploadedUrls.push(data.url);
            }

            setNewImages(prev => [...prev, ...uploadedUrls].slice(0, 4));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <section className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Отзывы покупателей</h2>
                <div className={styles.summary}>
                    <div className={styles.stars}>
                        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
                    </div>
                    <span className={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : 'Нет оценок'}</span>
                    <span className={styles.count}>({count})</span>
                </div>
            </div>

            {canReview ? (
                <div className={styles.formContainer}>
                    {!showForm ? (
                        <button className={styles.openBtn} onClick={() => setShowForm(true)}>
                            Написать отзыв
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Новый отзыв</h3>

                            <div className={styles.formGroup}>
                                <label>Оцените товар (1-5 звезд)</label>
                                <div className={styles.ratingSelect}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewRating(star)}
                                            style={{ color: star <= newRating ? '#f59e0b' : '#e5e7eb' }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                {reviewCriteria && reviewCriteria.length > 0 && (
                                    <div className={styles.criteriaFormGrid}>
                                        {reviewCriteria.map(criterion => (
                                            <div key={criterion.name} className={styles.criteriaFormItemSelect}>
                                                <span className={styles.criteriaLabel}>{criterion.name}</span>
                                                <CustomSelect
                                                    options={criterion.options}
                                                    value={newCriteriaRatings[criterion.name] || ''}
                                                    onChange={(val) => setNewCriteriaRatings(prev => ({ ...prev, [criterion.name]: val }))}
                                                    placeholder="выбрать"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Ваш комментарий *</label>
                                <textarea
                                    required
                                    placeholder="Поделитесь впечатлениями о товаре..."
                                    value={newText}
                                    onChange={e => setNewText(e.target.value)}
                                    rows={4}
                                ></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formGroupLabelBig}>Загрузите до 4 фотографий</label>
                                <div className={styles.mediaUploadGrid}>
                                    {newImages.map((url, i) => (
                                        <div key={i} className={styles.mediaPreviewBtn}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="Превью" />
                                            <button
                                                type="button"
                                                className={styles.mediaRemoveBtn}
                                                onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))}
                                            >✕</button>
                                        </div>
                                    ))}
                                    {newImages.length < 4 && (
                                        <div className={styles.uploadBtnContainer}>
                                            <label className={styles.mediaUploadLabel}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                    style={{ display: 'none' }}
                                                />
                                                {isUploading ? (
                                                    <div className={styles.iconCenterAbsolute}>
                                                        <div className={styles.uploadSpinner}>↻</div>
                                                    </div>
                                                ) : (
                                                    <div className={styles.iconCenterAbsolute}>
                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
                                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                            <circle cx="13" cy="13" r="4"></circle>
                                                            <circle cx="21" cy="21" r="5" stroke="none" className={styles.plusBg}></circle>
                                                            <path d="M21 18v6M18 21h6" strokeWidth="2"></path>
                                                        </svg>
                                                    </div>
                                                )}
                                            </label>
                                            <div className={styles.uploadHelperText}>
                                                <div className={styles.helperTitle}>Нажмите на область с иконкой</div>
                                                <div className={styles.helperFormats}>Формат JPG, JPEG, PNG, BMP, GIF</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Отмена</button>
                                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                                    {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <div className={styles.loginBanner}>
                    <p>{cantReviewReason}</p>
                </div>
            )}

            <div className={styles.list}>
                {isLoading ? (
                    <p>Загрузка отзывов...</p>
                ) : reviews.length === 0 ? (
                    <p style={{ color: 'var(--color-gray-500)' }}>Пока нет отзывов. Станьте первым!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.userInfo}>
                                    {review.user?.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={review.user.image} alt="Аватар" className={styles.avatar} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {(review.user?.name || 'А')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <strong>{review.user?.name || 'Аноним'}</strong>
                                </div>
                                <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.reviewStars} style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>

                            {review.criteriaRatings && typeof review.criteriaRatings === 'object' && Object.keys(review.criteriaRatings).length > 0 && (
                                <div className={styles.reviewCriteriaGrid}>
                                    {Object.entries(review.criteriaRatings).map(([crit, val]) => (
                                        <div key={crit} className={styles.reviewCriteriaItem}>
                                            <span className={styles.critName}>{crit.replace(/:+$/, '')}:</span>
                                            <span className={styles.critStars} style={{ color: 'var(--color-gray-900)', fontWeight: 600, letterSpacing: 'normal' }}>
                                                {String(val)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={styles.reviewText}>
                                {review.text}
                            </div>
                            {(() => {
                                const imagesArr = Array.isArray(review.images)
                                    ? review.images
                                    : (typeof review.images === 'string'
                                        ? review.images.split(',').map((img: string) => img.trim()).filter(Boolean)
                                        : []);

                                if (imagesArr.length === 0) return null;

                                return (
                                    <div className={`${styles.reviewImagesCollage} ${styles['collage' + Math.min(imagesArr.length, 4)]}`}>
                                        {imagesArr.map((img: string, i: number) => (
                                            <div key={i} className={styles.collageItem} onClick={() => openLightbox(imagesArr, i)}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img} alt="Фото отзыва" />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    ))
                )}
            </div>

            {lightboxOpen && (
                <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
                    <button className={styles.lightboxClose}>✕</button>
                    {lightboxImages.length > 1 && (
                        <button
                            className={styles.lightboxPrev}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + lightboxImages.length) % lightboxImages.length); }}
                        >‹</button>
                    )}
                    <div className={styles.lightboxImageContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lightboxImages[currentImageIndex]}
                            alt="Fullscreen"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    {lightboxImages.length > 1 && (
                        <button
                            className={styles.lightboxNext}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % lightboxImages.length); }}
                        >›</button>
                    )}
                    {lightboxImages.length > 1 && (
                        <div className={styles.lightboxCounter}>
                            {currentImageIndex + 1} / {lightboxImages.length}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
