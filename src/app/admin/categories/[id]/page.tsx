import { prisma } from '@/lib/prisma';
import CategoryFormClient from '../CategoryFormClient';
import styles from '../../Admin.module.css';
import { notFound } from 'next/navigation';

export default async function AdminCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isNew = id === 'new';

    let initialData = undefined;
    if (!isNew) {
        const cat = await prisma.category.findUnique({
            where: { id },
            select: { id: true, name: true, slug: true, image: true }
        });
        if (!cat) return notFound();
        initialData = cat;
    }

    return (
        <div>
            <h1 className={styles.sectionTitle}>{isNew ? 'Новая категория' : `Редактирование: ${initialData?.name}`}</h1>
            <CategoryFormClient initialData={initialData as any} />
        </div>
    );
}
