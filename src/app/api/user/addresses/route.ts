import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Получение списка адресов
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { userId: session.user.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        return NextResponse.json({ error: 'Ошибка при получении адресов' }, { status: 500 });
    }
}

// Добавление нового адреса
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const body = await request.json();
        const { title, addressLine, isDefault } = body;

        if (!title?.trim() || !addressLine?.trim()) {
            return NextResponse.json({ error: 'Название и адрес обязательны' }, { status: 400 });
        }

        // Если новый адрес помечен как "по умолчанию", сбрасываем остальные
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id },
                data: { isDefault: false }
            });
        }

        // Защита, если это первый адрес, делаем его по умолчанию автоматически
        const existingCount = await prisma.address.count({ where: { userId: session.user.id } });
        const shouldBeDefault = existingCount === 0 || isDefault;

        const newAddress = await prisma.address.create({
            data: {
                title: title.trim(),
                addressLine: addressLine.trim(),
                isDefault: shouldBeDefault,
                userId: session.user.id,
            }
        });

        return NextResponse.json({ address: newAddress });
    } catch (error) {
        console.error('Create address error:', error);
        return NextResponse.json({ error: 'Ошибка при добавлении адреса' }, { status: 500 });
    }
}
