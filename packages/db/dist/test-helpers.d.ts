import { ChannelType, SenderType } from './index.js';
export declare function createTestOrg(): Promise<{
    name: string;
    id: string;
    clerkOrgId: string;
    settings: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    stripeStatus: string | null;
    trialEndsAt: Date | null;
}>;
export declare function createTestIntegration(orgId: string, options?: {
    platform?: ChannelType;
    externalAccountId?: string;
    accessToken?: string | null;
    fromEmail?: string | null;
}): Promise<{
    id: string;
    createdAt: Date;
    organizationId: string;
    platform: import("@prisma/client").$Enums.ChannelType;
    externalAccountId: string;
    fromEmail: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: Date | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare function createTestCustomer(orgId: string, platformId: string, options?: {
    name?: string;
}): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    organizationId: string;
    platformId: string;
    profilePicUrl: string | null;
    deletedAt: Date | null;
}>;
export declare function createTestThread(orgId: string, customerId: string, channel: ChannelType, options?: {
    tag?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    organizationId: string;
    deletedAt: Date | null;
    customerId: string;
    channelType: import("@prisma/client").$Enums.ChannelType;
    status: import("@prisma/client").$Enums.ThreadStatus;
    aiSummary: string | null;
    tag: string | null;
    shopifyCustomerId: string | null;
    cachedPlanMessageId: string | null;
    cachedPlan: import("@prisma/client/runtime/library").JsonValue | null;
    archivedAt: Date | null;
}>;
export declare function createTestMessage(threadId: string, content: string, senderType?: SenderType): Promise<{
    id: string;
    deletedAt: Date | null;
    rating: number | null;
    threadId: string;
    senderType: import("@prisma/client").$Enums.SenderType;
    contentText: string | null;
    mediaUrl: string | null;
    attachments: string[];
    externalMessageId: string | null;
    sentAt: Date;
}>;
export declare function cleanupTestData(orgId?: string | null): Promise<void>;
