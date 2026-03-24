import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from '../Admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 24px' }}>
                <div>
                    <h1 className={styles.sectionTitle}>Категории каталога</h1>
                    <p style={{ color: 'var(--color-gray-500)' }}>
                        Управление разделами магазина
                    </p>
                </div>
                <Link
                    href="/admin/categories/new"
                    style={{
                        padding: '10px 20px', background: 'var(--color-primary-600)', color: 'white',
                        borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
                    }}
                >
                    Создать категорию
                </Link>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', maxWidth: '800px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-subtle)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Обложка</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Название / Slug</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)' }}>Товаров</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-gray-500)', textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                                    Категорий пока нет
                                </td>
                            </tr>
                        ) : categories.map((cat) => (
                            <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-bg-subtle)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={cat.image || 'https://placehold.co/100x100?text=Нет+фото'}
                                        alt={cat.name}
                                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: 'var(--color-bg)' }}
                                    />
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <Link href={`/catalog?category=${cat.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>{cat.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>/{cat.slug}</div>
                                    </Link>
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                                    {cat._count.products} шт.
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <Link
                                        href={`/admin/categories/${cat.id}`}
                                        style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                                    >
                                        Редактировать
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
