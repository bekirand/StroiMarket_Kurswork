import { prisma } from '@/lib/prisma';
import ProductFormClient from '../ProductFormClient';
import styles from '../../Admin.module.css';
import { notFound } from 'next/navigation';

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isNew = id === 'new';

    const categories = await prisma.category.findMany({ select: { id: true, name: true } });

    let initialData = undefined;
    if (!isNew) {
        const product = await prisma.product.findUnique({
            where: { id }
        });
        if (!product) return notFound();
        initialData = product;
    }

    return (
        <div>
            <h1 className={styles.sectionTitle}>{isNew ? 'Новый товар' : `Редактирование: ${initialData?.name}`}</h1>
            <ProductFormClient categories={categories} initialData={initialData as any} />
        </div>
    );
}
