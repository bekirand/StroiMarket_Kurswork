import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Доступ только менеджерам и админам
        if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const body = await req.json();
        const { name, sku, brand, description, price, images, unit, purchaseUnit, stockQuantity, discount, isActive, categoryId, reviewCriteria, features } = body;

        // Базовая валидация
        if (!name || !sku || !price || !categoryId) {
            return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
        }

        // Проверяем уникальность sku
        const existingProduct = await prisma.product.findUnique({ where: { sku } });
        if (existingProduct) {
            return NextResponse.json({ error: 'Товар с таким SKU уже существует' }, { status: 400 });
        }

        const product = await prisma.product.create({
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

        return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/admin/products]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
