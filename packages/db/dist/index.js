import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
const globalForPrisma = globalThis;
function createClient() {
    const log = (process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']);
    if (process.env.NEON_SERVERLESS_HTTP === 'true') {
        const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
        return new PrismaClient({ adapter, log });
    }
    return new PrismaClient({ log });
}
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = db;
export { Prisma, SenderType, ChannelType } from '@prisma/client';
