import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const yearParam = searchParams.get('year');
        const monthParam = searchParams.get('month'); // может быть null

        if (!yearParam) {
            return NextResponse.json({ error: 'Год обязателен' }, { status: 400 });
        }

        const isAllYears = yearParam === 'ALL';
        const year = isAllYears ? 0 : parseInt(yearParam, 10);
        const month = monthParam ? parseInt(monthParam, 10) : null;

        // Определяем границы времени
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (!isAllYears) {
            if (month !== null) {
                // Конкретный месяц
                startDate = new Date(year, month - 1, 1);
                endDate = new Date(year, month, 0, 23, 59, 59, 999);
            } else {
                // Весь год
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31, 23, 59, 59, 999);
            }
        }

        // Ищем информацию о сбросе
        const resetRecord = !isAllYears ? await prisma.analyticsReset.findFirst({
            where: {
                year: year,
                month: month,
            }
        }) : null;

        // Если был сброс, данные начинаются только от даты сброса
        if (resetRecord && startDate && resetRecord.resetAt > startDate) {
            startDate = resetRecord.resetAt;
        }

        // Запрашиваем заказы
        const orders = await prisma.order.findMany({
            where: isAllYears ? undefined : {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            select: {
                createdAt: true,
                totalPrice: true,
                status: true,
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Аггрегируем данные для графика
        const chartDataMap = new Map<string, { label: string; revenue: number; orders: number }>();

        if (isAllYears) {
            // Группируем по годам (извлекаем все уникальные года из заказов)
            const minYear = orders.length > 0 ? orders[0]!.createdAt.getFullYear() : new Date().getFullYear();
            const maxYear = orders.length > 0 ? orders[orders.length - 1]!.createdAt.getFullYear() : new Date().getFullYear();

            for (let i = minYear; i <= maxYear; i++) {
                chartDataMap.set(String(i), { label: String(i), revenue: 0, orders: 0 });
            }

            for (const order of orders) {
                const isValidForRevenue = order.status === 'DOSTAVLEN';
                const orderYear = order.createdAt.getFullYear().toString();

                const current = chartDataMap.get(orderYear);
                if (current) {
                    current.orders += 1;
                    if (isValidForRevenue) {
                        current.revenue += Number(order.totalPrice);
                    }
                }
            }
        } else if (month === null) {
            // Для всего года генерируем 12 месяцев
            const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
            for (let i = 0; i < 12; i++) {
                chartDataMap.set(String(i), { label: months[i]!, revenue: 0, orders: 0 });
            }

            for (const order of orders) {
                // Только доставленные заказы учитываем в выручке
                const isValidForRevenue = order.status === 'DOSTAVLEN';
                const orderMonth = order.createdAt.getMonth().toString();

                const current = chartDataMap.get(orderMonth)!;
                current.orders += 1;
                if (isValidForRevenue) {
                    current.revenue += Number(order.totalPrice);
                }
            }
        } else {
            // Для конкретного месяца генерируем дни
            const daysInMonth = endDate!.getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                chartDataMap.set(String(i), { label: `${i} ${getMonthNameGenitive(month)}`, revenue: 0, orders: 0 });
            }

            for (const order of orders) {
                const isValidForRevenue = order.status === 'DOSTAVLEN';
                const orderDay = order.createdAt.getDate().toString();

                const current = chartDataMap.get(orderDay);
                if (current) {
                    current.orders += 1;
                    if (isValidForRevenue) {
                        current.revenue += Number(order.totalPrice);
                    }
                }
            }
        }

        const chartData = Array.from(chartDataMap.values());

        const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
        const totalOrders = chartData.reduce((acc, curr) => acc + curr.orders, 0);

        return NextResponse.json({
            chartData,
            summary: {
                totalRevenue,
                totalOrders,
                averageTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0
            },
            hasReset: !!resetRecord
        });

    } catch (error) {
        console.error('[GET /api/admin/analytics]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

function getMonthNameGenitive(month: number) {
    const names = [
        'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    return names[month - 1] || '';
}
