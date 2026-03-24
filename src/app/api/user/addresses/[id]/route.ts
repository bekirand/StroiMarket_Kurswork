import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, addressLine, isDefault } = body;

        // Проверяем, принадлежит ли адрес пользователю
        const existingAddress = await prisma.address.findUnique({
            where: { id }
        });

        if (!existingAddress || existingAddress.userId !== session.user.id) {
            return NextResponse.json({ error: 'Адрес не найден' }, { status: 404 });
        }

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id },
                data: { isDefault: false }
            });
        }

        const dataToUpdate: any = {};
        if (title?.trim()) dataToUpdate.title = title.trim();
        if (addressLine?.trim()) dataToUpdate.addressLine = addressLine.trim();
        if (isDefault !== undefined) dataToUpdate.isDefault = isDefault;

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: dataToUpdate
        });

        return NextResponse.json({ address: updatedAddress });
    } catch (error) {
        console.error('Update address error:', error);
        return NextResponse.json({ error: 'Ошибка при обновлении адреса' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const { id } = await params;

        const existingAddress = await prisma.address.findUnique({
            where: { id }
        });

        if (!existingAddress || existingAddress.userId !== session.user.id) {
            return NextResponse.json({ error: 'Адрес не найден' }, { status: 404 });
        }

        await prisma.address.delete({
            where: { id }
        });

        // Если удалили дефолтный адрес, надо назначить новый дефолтный, если есть другие
        if (existingAddress.isDefault) {
            const firstRemaining = await prisma.address.findFirst({
                where: { userId: session.user.id }
            });
            if (firstRemaining) {
                await prisma.address.update({
                    where: { id: firstRemaining.id },
                    data: { isDefault: true }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete address error:', error);
        return NextResponse.json({ error: 'Ошибка при удалении адреса' }, { status: 500 });
    }
}
