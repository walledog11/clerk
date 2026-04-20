import { db, ChannelType, SenderType } from './index.js';
import { randomUUID } from 'crypto';
export async function createTestOrg() {
    const uid = randomUUID();
    return db.organization.create({
        data: {
            clerkOrgId: `org_test_${uid}`,
            name: `Test Org ${uid.slice(0, 8)}`,
        },
    });
}
export async function createTestIntegration(orgId, options = {}) {
    const { platform = ChannelType.email, externalAccountId = `test_${randomUUID()}`, accessToken = null, fromEmail = null, } = options;
    return db.integration.create({
        data: { organizationId: orgId, platform, externalAccountId, accessToken, fromEmail },
    });
}
export async function createTestCustomer(orgId, platformId, options = {}) {
    return db.customer.create({
        data: { organizationId: orgId, platformId, name: options.name ?? null },
    });
}
export async function createTestThread(orgId, customerId, channel, options = {}) {
    return db.thread.create({
        data: {
            organizationId: orgId,
            customerId,
            channelType: channel,
            status: 'open',
            tag: options.tag ?? 'Support',
        },
    });
}
export async function createTestMessage(threadId, content, senderType = SenderType.customer) {
    return db.message.create({
        data: { threadId, contentText: content, senderType },
    });
}
export async function cleanupTestData(orgId) {
    if (!orgId)
        return;
    await db.organization.delete({ where: { id: orgId } }).catch(() => undefined);
}
