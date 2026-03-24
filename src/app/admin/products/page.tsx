import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from '../Admin.module.css';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 24px' }}>
                <div>
                    <h1 className={styles.sectionTitle}>Управление товарами ({products.length})</h1>
                    <p style={{ color: 'var(--color-gray-500)' }}>
                        Добавление, редактирование и удаление товаров
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    style={{
                        padding: '10px 20px', background: 'var(--color-primary-600)', color: 'white',
                        borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
                    }}
                >
                    Добавить товар
                </Link>
            </div>

            <ProductsClient initialProducts={products} />
        </div>
    );
}
