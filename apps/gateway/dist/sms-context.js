/**
 * SMS Conversation Context Manager
 *
 * Persists per-sender state in the DB (sms_contexts table) scoped to the org.
 * Replaces the Redis-based implementation that lost context on Redis restart.
 */
import { db, Prisma } from '@clerk/db';
const MAX_HISTORY_TURNS = 20;
export async function getContext(organizationId, phone) {
    const row = await db.smsContext.findUnique({
        where: { organizationId_phoneNumber: { organizationId, phoneNumber: phone } },
    });
    if (!row)
        return { lastOrderNumber: null, lastThreadId: null, history: [], pendingPlan: null };
    return {
        lastOrderNumber: row.lastOrderNumber ?? null,
        lastThreadId: row.lastThreadId ?? null,
        history: Array.isArray(row.history) ? row.history : [],
        pendingPlan: row.pendingPlan ? row.pendingPlan : null,
    };
}
export async function updateContext(organizationId, phone, updates) {
    const current = await getContext(organizationId, phone);
    const next = { ...current, ...updates };
    if (next.history && next.history.length > MAX_HISTORY_TURNS) {
        next.history = next.history.slice(-MAX_HISTORY_TURNS);
    }
    await db.smsContext.upsert({
        where: { organizationId_phoneNumber: { organizationId, phoneNumber: phone } },
        update: {
            lastOrderNumber: next.lastOrderNumber ?? null,
            lastThreadId: next.lastThreadId ?? null,
            history: next.history,
            pendingPlan: next.pendingPlan ? next.pendingPlan : Prisma.DbNull,
        },
        create: {
            organizationId,
            phoneNumber: phone,
            lastOrderNumber: next.lastOrderNumber ?? null,
            lastThreadId: next.lastThreadId ?? null,
            history: next.history,
            pendingPlan: next.pendingPlan ? next.pendingPlan : Prisma.DbNull,
        },
    });
}
export async function clearContext(organizationId, phone) {
    await db.smsContext.deleteMany({
        where: { organizationId, phoneNumber: phone },
    });
}
/**
 * Extract the first order number from a message body.
 * Matches formats: #1234, order 1234, order #1234, ORDER-1234
 * Returns null if nothing found.
 */
export function extractOrderNumber(text) {
    const match = text.match(/#(\d+)|order[- #]*(\d+)/i);
    if (!match)
        return null;
    const num = match[1] || match[2];
    return `#${num}`;
}
