/**
 * lib/products.ts — Серверные функции для работы с товарами через Prisma
 * Используются напрямую в Server Components (без API-роутов)
 */
import { prisma } from '@/lib/prisma';

// ── Типы ────────────────────────────────────────────────
export interface ProductFilters {
    search?: string;
    categorySlug?: string;
}

// ── Запросы ─────────────────────────────────────────────

/** Список товаров с фильтрами */
export async function getProducts(filters: ProductFilters = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { isActive: true };

    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    if (filters.categorySlug) {
        where.category = { slug: filters.categorySlug };
    }

    return prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
    });
}

/** Один товар по SKU */
export async function getProductBySku(sku: string) {
    return prisma.product.findUnique({
        where: { sku },
        include: { category: { select: { id: true, name: true, slug: true } } },
    });
}

/** Все категории с кол-вом активных товаров */
export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: { where: { isActive: true } } },
            },
        },
    });
}

/** Популярные товары для главной страницы */
export async function getFeaturedProducts(limit = 4) {
    return prisma.product.findMany({
        where: { isActive: true, stockQuantity: { gt: 0 } },
        take: limit,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
    });
}
