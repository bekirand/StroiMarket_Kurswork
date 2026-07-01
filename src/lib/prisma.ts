/**
 * Prisma-клиент — единственный экземпляр для всего приложения (singleton)
 *
 * В режиме разработки Next.js перезапускает модули при hot-reload,
 * что создаёт множество подключений к БД. Этот паттерн предотвращает это.
 *
 * В Prisma 7 для прямого подключения к PostgreSQL используется адаптер @prisma/adapter-pg
 */
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Добавляем prisma в глобальный объект Node.js (только для разработки)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Создаёт новый экземпляр PrismaClient с адаптером PostgreSQL
 */
function createPrismaClient(): PrismaClient {
    // Используем DIRECT_URL (порт 5432), так как pg.Pool конфликтует с PgBouncer (порт 6543)
    // в транзакционном режиме (Connection terminated unexpectedly из-за prepared statements)
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
        adapter,
        log: ['query', 'error', 'warn']
    });
}

// Используем существующий экземпляр или создаём новый
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Сохраняем экземпляр глобально ТОЛЬКО в разработке
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
