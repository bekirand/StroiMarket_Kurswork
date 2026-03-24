import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';

export default async function AccountPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Получаем пользователя, историю заказов и адреса параллельно
    const [user, orders, addresses] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, name: true, email: true, phone: true, image: true, role: true }
        }),
        prisma.order.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { customerEmail: session.user.email }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true }
                }
            }
        }),
        prisma.address.findMany({
            where: { userId: session.user.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
        })
    ]);

    return (
        <AccountClient
            user={user}
            orders={orders}
            initialAddresses={addresses}
        />
    );
}
