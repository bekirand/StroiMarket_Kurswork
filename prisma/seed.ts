/**
 * Seed-файл — заполнение базы данных тестовыми данными
 * Запуск: npx prisma db seed
 *
 * При запуске:
 * 1. Удаляются все существующие данные
 * 2. Создаются категории товаров
 * 3. Создаются тестовые пользователи (admin, менеджер, покупатель)
 * 4. Создаются товары (~20 штук) по категориям
 */
import 'dotenv/config'; // Загружаем переменные из .env файла
import { PrismaClient, UserRole } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

// Инициализируем клиент с адаптером для прямого подключения к PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Запуск seed-файла...');

    // --- Очистка существующих данных (в правильном порядке из-за FK) ---
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.managerRequest.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Старые данные удалены');

    // --- Создание категорий ---
    const categories = await Promise.all([
        prisma.category.create({
            data: { name: 'Лакокрасочные материалы', slug: 'lakokrasochnye' },
        }),
        prisma.category.create({
            data: { name: 'Кирпич и блоки', slug: 'kirpich-i-bloki' },
        }),
        prisma.category.create({
            data: { name: 'Цемент и смеси', slug: 'cement-i-smesi' },
        }),
        prisma.category.create({
            data: { name: 'Инструменты', slug: 'instrumenty' },
        }),
        prisma.category.create({
            data: { name: 'Кровля и фасад', slug: 'krovlya-i-fasad' },
        }),
    ]);
    console.log(`✅ Создано категорий: ${categories.length}`);

    const [lakokras, kirpich, cement, tools, krovlya] = categories;

    // --- Создание товаров ---
    const products = await prisma.product.createMany({
        data: [
            // Лакокрасочные материалы
            {
                sku: 'SM-001', name: 'Краска акриловая белая 10л',
                description: 'Универсальная акриловая краска для внутренних работ. Матовое покрытие, высокая укрывистость, быстро сохнет.',
                price: 1850, images: [], unit: 'шт', purchaseUnit: 'упаковка (4 шт)',
                stockQuantity: 50, discount: 0, categoryId: lakokras.id,
            },
            {
                sku: 'SM-002', name: 'Грунтовка универсальная 5л',
                description: 'Грунтовка глубокого проникновения для подготовки поверхностей перед покраской.',
                price: 650, images: [], unit: 'шт', purchaseUnit: 'упаковка (6 шт)',
                stockQuantity: 80, discount: 10, categoryId: lakokras.id,
            },
            {
                sku: 'SM-003', name: 'Эмаль ПФ-115 серая 3кг',
                description: 'Алкидная эмаль для наружных и внутренних работ по металлу и дереву.',
                price: 420, images: [], unit: 'шт', purchaseUnit: 'упаковка (12 шт)',
                stockQuantity: 35, discount: 0, categoryId: lakokras.id,
            },
            {
                sku: 'SM-004', name: 'Шпаклёвка финишная 20кг',
                description: 'Полимерная финишная шпаклёвка для идеально гладкой поверхности стен и потолков.',
                price: 780, images: [], unit: 'мешок', purchaseUnit: 'паллет (50 мешков)',
                stockQuantity: 120, discount: 5, categoryId: lakokras.id,
            },
            // Кирпич и блоки
            {
                sku: 'SM-010', name: 'Кирпич облицовочный красный',
                description: 'Керамический облицовочный кирпич. Размер 250×120×65 мм. Морозостойкость F50.',
                price: 18, images: [], unit: 'шт', purchaseUnit: 'паллет (400 шт)',
                stockQuantity: 5000, discount: 0, categoryId: kirpich.id,
            },
            {
                sku: 'SM-011', name: 'Газобетонный блок D500',
                description: 'Автоклавный газобетон плотностью D500. Размер 600×300×200 мм.',
                price: 145, images: [], unit: 'шт', purchaseUnit: 'паллет (40 шт)',
                stockQuantity: 800, discount: 0, categoryId: kirpich.id,
            },
            {
                sku: 'SM-012', name: 'Кирпич силикатный белый',
                description: 'Силикатный кирпич для перегородок и несущих стен. Размер 250×120×88 мм.',
                price: 14, images: [], unit: 'шт', purchaseUnit: 'паллет (500 шт)',
                stockQuantity: 3000, discount: 0, categoryId: kirpich.id,
            },
            {
                sku: 'SM-013', name: 'Пеноблок 600×300×100',
                description: 'Лёгкий пенобетонный блок для межкомнатных перегородок. Плотность D400.',
                price: 68, images: [], unit: 'шт', purchaseUnit: 'паллет (64 шт)',
                stockQuantity: 640, discount: 8, categoryId: kirpich.id,
            },
            // Цемент и смеси
            {
                sku: 'SM-020', name: 'Цемент М500 50кг',
                description: 'Портланд-цемент марки М500. Подходит для фундаментов, стяжек, монолитных конструкций.',
                price: 380, images: [], unit: 'мешок', purchaseUnit: 'паллет (40 мешков)',
                stockQuantity: 200, discount: 0, categoryId: cement.id,
            },
            {
                sku: 'SM-021', name: 'Пескобетон М300 40кг',
                description: 'Сухая смесь для устройства стяжек пола. Класс прочности В22,5.',
                price: 220, images: [], unit: 'мешок', purchaseUnit: 'паллет (50 мешков)',
                stockQuantity: 300, discount: 0, categoryId: cement.id,
            },
            {
                sku: 'SM-022', name: 'Плиточный клей 25кг',
                description: 'Цементный клей С1 для укладки керамической плитки на стены и полы.',
                price: 310, images: [], unit: 'мешок', purchaseUnit: 'паллет (48 мешков)',
                stockQuantity: 180, discount: 15, categoryId: cement.id,
            },
            {
                sku: 'SM-023', name: 'Штукатурка гипсовая 30кг',
                description: 'Машинная гипсовая штукатурка для ровных и гладких стен внутри помещений.',
                price: 450, images: [], unit: 'мешок', purchaseUnit: 'паллет (40 мешков)',
                stockQuantity: 160, discount: 0, categoryId: cement.id,
            },
            // Инструменты
            {
                sku: 'SM-030', name: 'Перфоратор SDS+ 800Вт',
                description: 'Профессиональный перфоратор с патроном SDS+. Мощность 800 Вт, 3 режима работы.',
                price: 6500, images: [], unit: 'шт', purchaseUnit: 'шт',
                stockQuantity: 15, discount: 0, categoryId: tools.id,
            },
            {
                sku: 'SM-031', name: 'Дрель ударная 720Вт',
                description: 'Ударная дрель с металлическим редуктором. Патрон 13 мм, 2 скорости.',
                price: 3200, images: [], unit: 'шт', purchaseUnit: 'шт',
                stockQuantity: 20, discount: 10, categoryId: tools.id,
            },
            {
                sku: 'SM-032', name: 'Шпатель нержавеющий 30см',
                description: 'Профессиональный шпатель из нержавеющей стали. Гибкое полотно 0,8 мм.',
                price: 280, images: [], unit: 'шт', purchaseUnit: 'упаковка (10 шт)',
                stockQuantity: 60, discount: 0, categoryId: tools.id,
            },
            {
                sku: 'SM-033', name: 'Уровень строительный 120см',
                description: 'Алюминиевый строительный уровень 120 см. 3 колбы, точность 0,5 мм/м.',
                price: 650, images: [], unit: 'шт', purchaseUnit: 'упаковка (5 шт)',
                stockQuantity: 30, discount: 0, categoryId: tools.id,
            },
            // Кровля и фасад
            {
                sku: 'SM-040', name: 'Профнастил С8 цветной',
                description: 'Стальной профнастил С8 с полимерным покрытием. Толщина 0,5 мм. Длина 2 м.',
                price: 520, images: [], unit: 'лист', purchaseUnit: 'упаковка (10 листов)',
                stockQuantity: 200, discount: 0, categoryId: krovlya.id,
            },
            {
                sku: 'SM-041', name: 'Металлочерепица классик',
                description: 'Металлочерепица с полиэстерным покрытием. Толщина 0,45 мм. Ширина 1180 мм.',
                price: 380, images: [], unit: 'м²', purchaseUnit: 'паллет (100 м²)',
                stockQuantity: 500, discount: 5, categoryId: krovlya.id,
            },
            {
                sku: 'SM-042', name: 'Утеплитель ROCKWOOL 100мм',
                description: 'Минеральная вата ROCKWOOL ЛАЙТ БАТТС. Плотность 37 кг/м³, пачка 4 плиты.',
                price: 1450, images: [], unit: 'упаковка', purchaseUnit: 'паллет (16 упаковок)',
                stockQuantity: 80, discount: 0, categoryId: krovlya.id,
            },
            {
                sku: 'SM-043', name: 'Пароизоляция 1,6×50м',
                description: 'Полипропиленовая пароизоляционная плёнка. Рулон 1,6×50 м = 80 м².',
                price: 890, images: [], unit: 'рулон', purchaseUnit: 'упаковка (5 рулонов)',
                stockQuantity: 45, discount: 0, categoryId: krovlya.id,
            },
        ],
    });
    console.log(`✅ Создано товаров: ${products.count}`);

    // --- Создание пользователей ---
    const adminHash = await bcrypt.hash('admin123', 10);
    const managerHash = await bcrypt.hash('manager123', 10);
    const customerHash = await bcrypt.hash('customer123', 10);

    await prisma.user.createMany({
        data: [
            {
                name: 'Администратор',
                email: 'admin@stroymarket.ru',
                passwordHash: adminHash,
                role: UserRole.ADMIN,
            },
            {
                name: 'Иван Менеджеров',
                email: 'manager@stroymarket.ru',
                passwordHash: managerHash,
                role: UserRole.MANAGER,
            },
            {
                name: 'Пётр Покупателев',
                email: 'customer@stroymarket.ru',
                passwordHash: customerHash,
                role: UserRole.CUSTOMER,
            },
        ],
    });
    console.log('✅ Создано пользователей: 3 (admin, manager, customer)');

    console.log('\n🎉 Seed выполнен успешно!');
    console.log('👤 Тестовые аккаунты:');
    console.log('   Admin:    admin@stroymarket.ru    / admin123');
    console.log('   Manager:  manager@stroymarket.ru  / manager123');
    console.log('   Customer: customer@stroymarket.ru / customer123');
}

main()
    .catch((e) => {
        console.error('❌ Ошибка seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
