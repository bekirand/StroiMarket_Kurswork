import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, email, message } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Укажите ваше имя' }, { status: 400 });
        }
        if (!phone?.trim()) {
            return NextResponse.json({ error: 'Укажите ваш телефон' }, { status: 400 });
        }
        if (!message?.trim()) {
            return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
        }

        const newMsg = await prisma.contactMessage.create({
            data: {
                name: name.trim(),
                phone: phone.trim(),
                email: email?.trim() || null,
                body: message.trim(),
            }
        });

        return NextResponse.json({ success: true, messageId: newMsg.id }, { status: 201 });
    } catch (error) {
        console.error('[POST /api/contacts]', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
