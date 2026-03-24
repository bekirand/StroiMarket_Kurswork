/**
 * Утилитарные функции проекта СтройМаркет
 */

/**
 * Форматирует число как цену в рублях
 * Пример: formatPrice(1500) → "1 500 ₽"
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Форматирует дату в русском формате
 * Пример: formatDate(new Date()) → "21 февраля 2026"
 */
export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

/**
 * Вычисляет цену товара с учётом скидки
 * Пример: calcDiscountedPrice(1000, 15) → 850
 */
export function calcDiscountedPrice(price: number, discount: number): number {
    if (discount <= 0) return price;
    return Math.round(price * (1 - discount / 100));
}

/**
 * Преобразует строку в URL-friendly slug
 * Пример: toSlug("Строительные материалы") → "stroitelnye-materialy"
 */
export function toSlug(text: string): string {
    const cyrillicToLatin: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i',
        й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
        у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
        ь: '', э: 'e', ю: 'yu', я: 'ya',
    };
    return text
        .toLowerCase()
        .split('')
        .map(char => cyrillicToLatin[char] ?? char)
        .join('')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Склонение существительных для числительных
 * Пример: pluralize(3, 'товар', 'товара', 'товаров') → "3 товара"
 */
export function pluralize(
    count: number,
    one: string,
    few: string,
    many: string,
): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod100 >= 11 && mod100 <= 19) return `${count} ${many}`;
    if (mod10 === 1) return `${count} ${one}`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} ${few}`;
    return `${count} ${many}`;
}

/**
 * Обрезает строку до нужной длины с многоточием
 * Пример: truncate("Длинный текст...", 10) → "Длинный те..."
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '...';
}
