import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { deleteImageKitFileByUrl, deleteImageKitFolder } from '@/lib/imagekit';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const body = await req.json();
        const { name, sku, brand, description, price, images, unit, purchaseUnit, stockQuantity, discount, isActive, categoryId, reviewCriteria, features } = body;

        // Проверяем уникальность sku для ДРУГИХ товаров
        const existingProduct = await prisma.product.findUnique({ where: { sku } });
        if (existingProduct && existingProduct.id !== id) {
            return NextResponse.json({ error: 'Другой товар с таким SKU уже существует' }, { status: 400 });
        }

        // Проверяем удаленные фото
        const oldProduct = await prisma.product.findUnique({ where: { id } });
        if (oldProduct) {
            const oldImages = oldProduct.images || [];
            const newImages = images || [];
            const removedImages = oldImages.filter((img: string) => !newImages.includes(img));

            // Удаляем старые фото из ImageKit (асинхронно, не ждем завершения, чтобы не тормозить запрос)
            removedImages.forEach((imgUrl: string) => {
                deleteImageKitFileByUrl(imgUrl).catch(console.error);
            });
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                sku,
                brand,
                description,
                price: Number(price),
                images: images || [],
                unit: unit || 'шт',
                purchaseUnit: purchaseUnit || 'шт',
                stockQuantity: Number(stockQuantity),
                discount: discount ? Number(discount) : 0,
                isActive: isActive ?? true,
                categoryId,
                reviewCriteria: Array.isArray(reviewCriteria) ? reviewCriteria : [],
                features: Array.isArray(features) ? features : [],
            }
        });

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('[PUT /api/admin/products/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        // Проверяем наличие заказанных товаров
        const orderItemsCount = await prisma.orderItem.count({
            where: { productId: id }
        });

        if (orderItemsCount > 0) {
            return NextResponse.json({
                error: 'Нельзя удалить товар, так как он уже есть в заказах. Попробуйте скрыть его из каталога, сняв галочку "Активен".'
            }, { status: 400 });
        }

        const product = await prisma.product.findUnique({ where: { id } });

        await prisma.product.delete({
            where: { id }
        });

        // Удаляем папку товара из ImageKit вместе со всеми фотографиями и отзывами
        if (product && product.sku) {
            deleteImageKitFolder(`/products/${product.sku}`).catch(console.error);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/admin/products/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера при удалении' }, { status: 500 });
    }
}
