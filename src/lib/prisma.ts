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
    // @prisma/adapter-pg v7 требует экземпляр pg.Pool, а не объект { connectionString }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
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
