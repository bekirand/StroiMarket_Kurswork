import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const body = await req.json();
        const { name, slug, image } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({ where: { slug } });
        if (existingCategory) {
            return NextResponse.json({ error: 'Категория с таким URL-алиасом (slug) уже существует' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                image: image || null,
            }
        });

        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/admin/categories]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
