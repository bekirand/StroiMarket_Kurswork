'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './GlobalSearch.module.css';

// Статические страницы
const STATIC_PAGES = [
    { title: 'Каталог', url: '/catalog', keywords: ['каталог', 'товары', 'магазин'] },
    { title: 'О компании', url: '/about', keywords: ['о нас', 'компания', 'информация', 'about'] },
    { title: 'Контакты', url: '/contacts', keywords: ['контакты', 'связаться', 'телефон', 'адрес'] },
];

function IconSearch() {
    return (
        <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    );
}

function IconLoader() {
    return (
        <svg className={styles.loader} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
    );
}

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{ pages: any[], categories: any[], products: any[] }>({
        pages: [], categories: [], products: []
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Закрытие при клике снаружи
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Логика поиска с дебаунсом
    useEffect(() => {
        if (query.trim().length === 0) {
            setResults({ pages: [], categories: [], products: [] });
            setIsOpen(false);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                // Ищем по статическим страницам локально
                const localPages = STATIC_PAGES.filter(p =>
                    p.title.toLowerCase().includes(query.toLowerCase()) ||
                    p.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
                );

                if (query.trim().length >= 2) {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults({
                            pages: localPages,
                            categories: data.categories || [],
                            products: data.products || []
                        });
                        setIsOpen(true);
                    }
                } else {
                    setResults({ pages: localPages, categories: [], products: [] });
                    setIsOpen(localPages.length > 0);
                }
            } catch (error) {
                console.error('Search error', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timerId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timerId);

    }, [query]);

    // Обработка перехода через Enter (первый результат)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isOpen) {
            e.preventDefault();
            if (results.products.length > 0) {
                router.push(`/catalog/${results.products[0].sku}`);
                closeSearch();
            } else if (results.categories.length > 0) {
                router.push(`/catalog?category=${results.categories[0].slug}`);
                closeSearch();
            } else if (results.pages.length > 0) {
                router.push(results.pages[0].url);
                closeSearch();
            }
        }
    };

    const closeSearch = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className={styles.searchWrapper} ref={wrapperRef}>
            <div className={styles.searchContainer}>
                <span className={styles.searchIcon} aria-hidden="true">
                    {isLoading ? <IconLoader /> : <IconSearch />}
                </span>
                <input
                    type="search"
                    placeholder="Поиск товаров, категорий..."
                    className={styles.searchInput}
                    aria-label="Поиск по каталогу"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen && e.target.value.trim().length > 0) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (query.trim().length > 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Выпадающий список */}
            {isOpen && (query.trim().length > 0) && (
                <div className={styles.dropdown}>
                    {results.pages.length === 0 && results.categories.length === 0 && results.products.length === 0 && !isLoading ? (
                        <div className={styles.emptyState}>
                            По запросу «{query}» ничего не найдено
                        </div>
                    ) : (
                        <>
                            {/* Страницы */}
                            {results.pages.length > 0 && (
                                <div className={styles.dropdownSection}>
                                    <div className={styles.sectionTitle}>Страницы</div>
                                    {results.pages.map(page => (
                                        <Link key={page.url} href={page.url} className={styles.resultItem} onClick={closeSearch}>
                                            <div className={styles.pageIcon}>
                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                            </div>
                                            <div className={styles.itemName}>{page.title}</div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Категории */}
                            {results.categories.length > 0 && (
                                <div className={styles.dropdownSection}>
                                    <div className={styles.sectionTitle}>Категории</div>
                                    {results.categories.map(cat => (
                                        <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className={styles.resultItem} onClick={closeSearch}>
                                            <div className={styles.pageIcon}>
                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                            </div>
                                            <div className={styles.itemName}>{cat.name}</div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Товары */}
                            {results.products.length > 0 && (
                                <div className={styles.dropdownSection}>
                                    <div className={styles.sectionTitle}>Товары</div>
                                    {results.products.map(prod => (
                                        <Link key={prod.id} href={`/catalog/${prod.sku}`} className={styles.resultItem} onClick={closeSearch}>
                                            <img
                                                src={prod.images?.[0] || 'https://ik.imagekit.io/yavw2x21m/placeholder.png'}
                                                alt={prod.name}
                                                className={styles.productImage}
                                            />
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemName} title={prod.name}>{prod.name}</div>
                                                <div className={styles.itemSub}>{prod.price.toLocaleString('ru-RU')} ₽ • {prod.sku}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
