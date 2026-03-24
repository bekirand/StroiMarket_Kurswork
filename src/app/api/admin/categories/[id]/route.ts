import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { deleteImageKitFileByUrl, deleteImageKitFolder } from '@/lib/imagekit';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const body = await req.json();
        const { name, slug, image } = body;

        const existingCategory = await prisma.category.findUnique({ where: { slug } });
        if (existingCategory && existingCategory.id !== id) {
            return NextResponse.json({ error: 'Другая категория с таким URL-алиасом (slug) уже существует' }, { status: 400 });
        }

        // Получаем старую категорию, чтобы проверить, не изменилась ли обложка
        const oldCategory = await prisma.category.findUnique({ where: { id } });
        if (!oldCategory) {
            return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
        }

        // Если новая картинка отличается от старой, удаляем старую из ImageKit
        if (oldCategory.image && oldCategory.image !== image) {
            deleteImageKitFileByUrl(oldCategory.image).catch(console.error);
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                image: image || null,
            }
        });

        return NextResponse.json({ success: true, category });
    } catch (error: any) {
        console.error('[PUT /api/admin/categories/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        // Только админы могут удалять категории
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен. Только администратор может удалять категории.' }, { status: 403 });
        }

        const productsCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productsCount > 0) {
            return NextResponse.json({
                error: 'Нельзя удалить категорию, так как в ней есть привязанные товары.'
            }, { status: 400 });
        }

        const category = await prisma.category.findUnique({ where: { id } });

        await prisma.category.delete({
            where: { id }
        });

        // После успешного удаления из БД очищаем папку в ImageKit
        if (category) {
            deleteImageKitFolder(`/categories/${category.slug}`).catch(console.error);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/admin/categories/[id]]', error);
        return NextResponse.json({ error: 'Ошибка сервера при удалении' }, { status: 500 });
    }
}
