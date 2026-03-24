import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Функция проверяет доступность картинки по HTTP HEAD запросу.
 * Если ImageKit вернул 404, значит картинки больше нет.
 */
async function checkImageExists(url: string): Promise<boolean> {
    try {
        // Добавляем timestamp, чтобы обойти кеш браузера/CDN, если ImageKit не успел очистить кэш
        const urlObj = new URL(url);
        urlObj.searchParams.append('check', Date.now().toString());

        const res = await fetch(urlObj.toString(), { method: 'HEAD', cache: 'no-store' });
        return res.ok;
    } catch (error) {
        console.error(`Error checking image ${url}:`, error);
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Разрешаем только МЕНЕДЖЕРАМ и АДМИНАМ
        if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        let removedCount = 0;

        // 1. Синхронизация Товаров
        const products = await prisma.product.findMany({ select: { id: true, images: true } });
        for (const p of products) {
            if (!p.images || p.images.length === 0) continue;

            const validImages: string[] = [];
            let changed = false;

            for (const img of p.images) {
                if (!img.includes('imagekit.io')) {
                    validImages.push(img); // Не ImageKit картинки оставляем
                    continue;
                }
                const exists = await checkImageExists(img);
                if (exists) {
                    validImages.push(img);
                } else {
                    changed = true;
                    removedCount++;
                }
            }

            if (changed) {
                await prisma.product.update({
                    where: { id: p.id },
                    data: { images: validImages }
                });
            }
        }

        // 2. Синхронизация Отзывов
        const reviews = await prisma.review.findMany({ select: { id: true, images: true } });
        for (const r of reviews) {
            if (!r.images || !Array.isArray(r.images) || r.images.length === 0) continue;

            const validImages: string[] = [];
            let changed = false;

            for (const img of r.images as string[]) {
                if (!img.includes('imagekit.io')) {
                    validImages.push(img);
                    continue;
                }
                const exists = await checkImageExists(img);
                if (exists) {
                    validImages.push(img);
                } else {
                    changed = true;
                    removedCount++;
                }
            }

            if (changed) {
                await prisma.review.update({
                    where: { id: r.id },
                    data: { images: validImages }
                });
            }
        }

        // 3. Синхронизация Аватаров
        const users = await prisma.user.findMany({
            select: { id: true, image: true },
            where: { image: { not: null } }
        });

        for (const u of users) {
            if (!u.image || !u.image.includes('imagekit.io')) continue;

            const exists = await checkImageExists(u.image);
            if (!exists) {
                await prisma.user.update({
                    where: { id: u.id },
                    data: { image: null }
                });
                removedCount++;
            }
        }

        // 4. Синхронизация Категорий
        const categories = await prisma.category.findMany({
            select: { id: true, image: true },
            where: { image: { not: null } }
        });

        for (const c of categories) {
            if (!c.image || !c.image.includes('imagekit.io')) continue;

            const exists = await checkImageExists(c.image);
            if (!exists) {
                await prisma.category.update({
                    where: { id: c.id },
                    data: { image: null }
                });
                removedCount++;
            }
        }

        return NextResponse.json({ success: true, removedCount });
    } catch (error) {
        console.error('[POST /api/admin/sync-images]', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
