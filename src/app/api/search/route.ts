import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Вычисление расстояния Левенштейна (количество замен/вставок/удалений для превращения s1 в s2)
function levenshtein(s1: string, s2: string): number {
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // удаление
                matrix[i][j - 1] + 1,      // вставка
                matrix[i - 1][j - 1] + cost // замена
            );
        }
    }
    return matrix[len1][len2];
}

// Проверка нечеткого совпадения (опечатки)
function isFuzzyMatch(text: string, query: string): boolean {
    const textWords = text.toLowerCase().split(/[\s,.-]+/);
    const queryWords = query.toLowerCase().split(/[\s,.-]+/);

    // Для каждого слова из запроса должно найтись похожее слово в тексте
    return queryWords.every(qWord => {
        if (!qWord) return true;
        return textWords.some(tWord => {
            if (tWord.includes(qWord)) return true; // Точное частичное совпадение

            // Если слово длиннее 3 символов, допускаем 1 опечатку
            if (qWord.length > 3) {
                const distance = levenshtein(tWord.substring(0, qWord.length), qWord);
                if (distance <= 1) return true;
            }
            // Если слово длиннее 5 символов, допускаем 2 опечатки
            if (qWord.length > 5) {
                const distance = levenshtein(tWord.substring(0, qWord.length + 1), qWord);
                if (distance <= 2) return true;
            }
            return false;
        });
    });
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ products: [], categories: [] });
        }

        const safeQuery = query.trim();

        // Поиск по категориям
        const categories = await prisma.category.findMany({
            where: {
                name: {
                    contains: safeQuery,
                    mode: 'insensitive' // регистронезависимый поиск
                }
            },
            take: 3, // ограничиваем 3 категориями
            select: { id: true, name: true, slug: true }
        });

        // Поиск по товарам (точное совпадение подстроки в базе)
        let products = await prisma.product.findMany({
            where: {
                isActive: true, // Только активные
                OR: [
                    { name: { contains: safeQuery, mode: 'insensitive' } },
                    { sku: { contains: safeQuery, mode: 'insensitive' } }
                ]
            },
            take: 6, // ограничиваем 6 товарами
            select: { id: true, name: true, sku: true, price: true, images: true, category: { select: { slug: true } } }
        });

        // Если точных совпадений мало, применяем умный поиск с опечатками
        if (products.length < 6) {
            const existingIds = products.map(p => p.id);

            // Вытягиваем товары для клиентского поиска (без тяжелых полей типа описания)
            const allProducts = await prisma.product.findMany({
                where: {
                    isActive: true,
                    id: { notIn: existingIds }
                },
                select: { id: true, name: true, sku: true, price: true, images: true, category: { select: { slug: true } } }
            });

            const fuzzyMatchedProducts = allProducts.filter(p =>
                isFuzzyMatch(p.name, safeQuery) || isFuzzyMatch(p.sku, safeQuery)
            );

            products = [...products, ...fuzzyMatchedProducts].slice(0, 6);
        }

        return NextResponse.json({ categories, products });

    } catch (error) {
        console.error('[GET /api/search]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
