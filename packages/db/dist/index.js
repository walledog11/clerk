import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
const globalForPrisma = globalThis;
function createClient() {
    const log = (process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']);
    if (process.env.NEON_SERVERLESS_HTTP === 'true' && process.env.NODE_ENV !== 'test') {
        const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
        return new PrismaClient({ adapter, log });
    }
    return new PrismaClient({ log });
}
const shouldCacheClient = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
export const db = shouldCacheClient
    ? (globalForPrisma.prisma ?? createClient())
    : createClient();
if (shouldCacheClient)
    globalForPrisma.prisma = db;
export { Prisma, SenderType, ChannelType } from '@prisma/client';
