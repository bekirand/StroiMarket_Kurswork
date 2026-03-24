import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import styles from '../Admin.module.css';
import MessagesClient from './MessagesClient';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
    const session = await auth();
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, canDeleteMessages: true }
    });

    if (!user) return null;

    const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const isAdmin = user.role === 'ADMIN';
    const canDelete = isAdmin || (user.role === 'MANAGER' && user.canDeleteMessages);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 24px' }}>
                <div>
                    <h1 className={styles.sectionTitle}>Сообщения от клиентов</h1>
                    <p style={{ color: 'var(--color-gray-500)' }}>
                        Обратная связь со страницы Контактов
                    </p>
                </div>
            </div>

            <MessagesClient initialMessages={messages as any} isAdmin={isAdmin} canDelete={canDelete} />
        </div>
    );
}
