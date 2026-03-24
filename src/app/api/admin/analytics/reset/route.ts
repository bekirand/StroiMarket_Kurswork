import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/admin/analytics/reset
// Создает "мягкий сброс" для выбранного месяца/года
export async function POST(req: Request) {
    try {
        const session = await auth();
        // Только Админ может сбрасывать статистику
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Только Администратор может сбрасывать статистику' }, { status: 403 });
        }

        const body = await req.json();
        const { year, month } = body;

        if (!year) {
            return NextResponse.json({ error: 'Год обязателен' }, { status: 400 });
        }

        // Обновляем или создаем запись (upsert)
        const resetRecord = await prisma.analyticsReset.upsert({
            where: {
                year_month: {
                    year: year,
                    month: (month !== undefined ? month : null) as any,
                }
            },
            update: {
                resetAt: new Date(), // Обновляем дату сброса на текущую
            },
            create: {
                year: year,
                month: month !== undefined ? month : null,
                resetAt: new Date(),
            }
        });

        return NextResponse.json({ success: true, reset: resetRecord });

    } catch (error) {
        console.error('[POST /api/admin/analytics/reset]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

// DELETE /api/admin/analytics/reset
// Отменяет "мягкий сброс" для выбранного месяца/года
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Только Администратор может отменять сброс статистики' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const yearParam = searchParams.get('year');
        const monthParam = searchParams.get('month');

        if (!yearParam) {
            return NextResponse.json({ error: 'Год обязателен' }, { status: 400 });
        }

        const year = parseInt(yearParam, 10);
        const month = monthParam && monthParam !== 'null' ? parseInt(monthParam, 10) : null;

        await prisma.analyticsReset.delete({
            where: {
                year_month: {
                    year: Math.floor(year),
                    month: (month === null ? null : Math.floor(month)) as any,
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[DELETE /api/admin/analytics/reset]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
