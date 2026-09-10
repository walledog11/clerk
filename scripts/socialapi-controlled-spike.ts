import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  createSocialApiClient,
  type SocialApiResult,
} from '../packages/integrations/src/socialapi/index.js';

type SpikeCommand = 'inspect' | 'connect' | 'exchange' | 'send' | 'disconnect' | 'pin';

const COMMANDS = new Set<SpikeCommand>(['inspect', 'connect', 'exchange', 'send', 'disconnect', 'pin']);
const CONTROLLED_REPLY_PREFIX = '[Shopkeeper SocialAPI controlled spike]';

function requiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optionalEnv(name: string, env: NodeJS.ProcessEnv): string | undefined {
  return env[name]?.trim() || undefined;
}

function fingerprint(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex').slice(0, 16)}`;
}

function unwrap<T>(label: string, result: SocialApiResult<T>): T {
  if (result.ok) return result.data;
  throw new Error(`${label} failed (${result.error.category}/${result.error.httpStatus}): ${result.error.message}`);
}

function parseCommand(argv: string[]): SpikeCommand {
  const command = argv[2];
  if (command && COMMANDS.has(command as SpikeCommand)) return command as SpikeCommand;
  throw new Error(
    'Usage: npm run spike:socialapi -- <inspect|connect|exchange|send|disconnect|pin> [--execute]',
  );
}

function requireExecute(argv: string[]): void {
  if (!argv.includes('--execute')) {
    throw new Error('This command changes provider or workspace state; rerun with --execute after checking the controlled target.');
  }
}

async function resolveControlledReplyRoute(
  api: ReturnType<typeof createSocialApiClient>,
  env: NodeJS.ProcessEnv,
  argv: string[],
): Promise<{ accountId: string; conversationId: string }> {
  const configuredAccountId = optionalEnv('SOCIALAPI_ACCOUNT_ID', env);
  const configuredConversationId = optionalEnv('SOCIALAPI_CONVERSATION_ID', env);
  if (configuredAccountId && configuredConversationId) {
    return { accountId: configuredAccountId, conversationId: configuredConversationId };
  }
  if (configuredAccountId || configuredConversationId) {
    throw new Error('Set both SOCIALAPI_ACCOUNT_ID and SOCIALAPI_CONVERSATION_ID, or neither.');
  }
  if (!argv.includes('--use-sole-account') || !argv.includes('--use-newest-conversation')) {
    throw new Error(
      'A reply without configured ids requires --use-sole-account and --use-newest-conversation.',
    );
  }

  const brandId = requiredEnv('SOCIALAPI_BRAND_ID', env);
  const accounts = unwrap('account inventory', await api.listInstagramAccounts(brandId));
  if (accounts.length !== 1) {
    throw new Error(`Expected exactly one assigned account, found ${accounts.length}.`);
  }
  const accountId = accounts[0]!.id;
  const conversations = unwrap(
    'conversation inventory',
    await api.listInstagramConversations({ accountId, limit: 1 }),
  );
  const conversation = conversations.data[0];
  if (!conversation) throw new Error('No conversation is available for the controlled reply.');
  const activityAt = Date.parse(conversation.lastMessageAt);
  const ageMs = Date.now() - activityAt;
  if (!Number.isFinite(activityAt) || ageMs < -60_000 || ageMs > 15 * 60_000) {
    throw new Error('The newest conversation does not have controlled activity from the last 15 minutes.');
  }
  return { accountId, conversationId: conversation.id };
}

async function inspect(
  api: ReturnType<typeof createSocialApiClient>,
  env: NodeJS.ProcessEnv,
  useSoleAccount: boolean,
  useNewestConversation: boolean,
): Promise<unknown> {
  const brandId = requiredEnv('SOCIALAPI_BRAND_ID', env);
  const accounts = unwrap('account inventory', await api.listInstagramAccounts(brandId));
  const webhooks = unwrap('webhook inventory', await api.listWebhookEndpoints());
  const report: Record<string, unknown> = {
    brand: fingerprint(brandId),
    accounts: accounts.map(account => ({
      id: fingerprint(account.id),
      brandId: fingerprint(account.brandId),
      platform: account.platform,
      status: account.status,
      reconnectRequired: account.reconnectReason !== null,
    })),
    webhooks: webhooks.map(endpoint => ({
      id: fingerprint(endpoint.id),
      url: fingerprint(endpoint.url),
      events: endpoint.events,
      isActive: endpoint.isActive,
      createdAt: endpoint.createdAt,
    })),
  };
  let selectedConversationId: string | undefined;
  let selectedConversationPlatformId: string | undefined;
  let selectedParticipantId: string | undefined;

  const configuredAccountId = optionalEnv('SOCIALAPI_ACCOUNT_ID', env);
  const accountId = configuredAccountId
    ?? (useSoleAccount && accounts.length === 1 ? accounts[0]!.id : undefined);
  if (accountId) {
    const account = unwrap(
      'assigned account lookup',
      await api.getInstagramAccount({ accountId, brandId }),
    );
    const conversations = unwrap(
      'conversation inventory',
      await api.listInstagramConversations({ accountId: account.id, limit: 25 }),
    );
    if (useNewestConversation) {
      selectedConversationId = conversations.data[0]?.id;
      selectedConversationPlatformId = conversations.data[0]?.platformId;
      selectedParticipantId = conversations.data[0]?.participantId;
    }
    report.conversations = {
      accountSelection: configuredAccountId ? 'configured' : 'sole_assigned_account',
      hasMore: conversations.hasMore,
      nextCursorPresent: conversations.nextCursor !== null,
      data: conversations.data.map(conversation => ({
        id: fingerprint(conversation.id),
        accountId: fingerprint(conversation.accountId),
        platformId: fingerprint(conversation.platformId),
        participantId: fingerprint(conversation.participantId),
        lastMessageAt: conversation.lastMessageAt,
        status: conversation.status,
        hasText: conversation.lastMessage !== null,
      })),
    };
  }

  const configuredConversationId = optionalEnv('SOCIALAPI_CONVERSATION_ID', env);
  const conversationId = configuredConversationId ?? selectedConversationId;
  if (conversationId) {
    const messages = unwrap(
      'message inventory',
      await api.listConversationMessages({ conversationId, limit: 25 }),
    );
    report.messages = {
      conversationSelection: configuredConversationId ? 'configured' : 'newest_conversation',
      hasMore: messages.hasMore,
      nextCursorPresent: messages.nextCursor !== null,
      data: messages.data.map(message => ({
        id: fingerprint(message.id),
        conversationId: fingerprint(message.conversationId),
        platformId: fingerprint(message.platformId),
        senderId: fingerprint(message.senderId),
        direction: message.direction,
        createdAt: message.createdAt,
        hasText: message.text !== null,
        attachmentType: message.attachmentType,
        hasAttachmentUrl: message.attachmentUrl !== null,
      })),
    };
    const incoming = messages.data.filter(message => message.direction === 'incoming');
    const directMetaSenderId = optionalEnv('SOCIALAPI_DIRECT_META_SENDER_ID', env);
    const expectedParticipantId = optionalEnv('SOCIALAPI_EXPECTED_PARTICIPANT_ID', env);
    report.identityEvidence = {
      conversationIdDiffersFromPlatformId: selectedConversationPlatformId
        ? conversationId !== selectedConversationPlatformId
        : null,
      incomingSenderMatchesConversationParticipant: selectedParticipantId
        ? incoming.length > 0 && incoming.every(message => message.senderId === selectedParticipantId)
        : null,
      incomingSenderMatchesExpectedParticipant: expectedParticipantId
        ? incoming.length > 0 && incoming.every(message => message.senderId === expectedParticipantId)
        : null,
      providerMessageIdsDifferFromPlatformIds: messages.data.every(
        message => message.id !== message.platformId,
      ),
      directMetaSenderComparison: directMetaSenderId && expectedParticipantId
        ? directMetaSenderId === expectedParticipantId
        : null,
    };
  }

  return report;
}


/**
 * Milestone-zero routing row. Creates or re-points one `ig_dm` integration to a
 * SocialAPI account so a controlled DM can reach the durable workflow before
 * OAuth exists. `@shopkeeper/db` is imported lazily so every other subcommand
 * still runs with no database configured. Unlike `inspect`, this prints the account
 * id in full: it is routing configuration the operator must copy into the gateway,
 * not evidence, so keep its output out of committed artifacts.
 */
async function pinIntegration(
  api: ReturnType<typeof createSocialApiClient>,
  env: NodeJS.ProcessEnv,
  argv: string[],
): Promise<Record<string, unknown>> {
  const organizationId = requiredEnv('SHOPKEEPER_ORGANIZATION_ID', env);
  const configuredAccountId = optionalEnv('SOCIALAPI_ACCOUNT_ID', env);
  let socialApiAccountId = configuredAccountId;
  if (!socialApiAccountId) {
    if (!argv.includes('--use-sole-account')) {
      throw new Error('Set SOCIALAPI_ACCOUNT_ID, or pass --use-sole-account to pin the brand\'s only account.');
    }
    const accounts = unwrap('account inventory', await api.listInstagramAccounts(
      requiredEnv('SOCIALAPI_BRAND_ID', env),
    ));
    if (accounts.length !== 1) {
      throw new Error(`Expected exactly one assigned account, found ${accounts.length}.`);
    }
    socialApiAccountId = accounts[0]!.id;
  }
  // The Instagram-native account id when it is known; the provider id otherwise.
  // Whatever is stored here is what the queued job carries and the worker matches.
  const externalAccountId = optionalEnv('SOCIALAPI_IG_ACCOUNT_ID', env) ?? socialApiAccountId;
  const { db } = await import('@shopkeeper/db');

  const metadata = {
    instagram: {
      authModel: 'socialapi',
      transport: 'socialapi',
      socialApiAccountId,
      connectedAt: new Date().toISOString(),
    },
  };

  const existing = await db.integration.findFirst({
    where: { organizationId, platform: 'ig_dm', externalAccountId },
    select: { id: true },
  });
  const integration = existing
    ? await db.integration.update({
      where: { id: existing.id },
      data: { accessToken: null, lifecycleStatus: 'active', metadata },
      select: { id: true },
    })
    : await db.integration.create({
      data: {
        organizationId,
        platform: 'ig_dm',
        externalAccountId,
        accessToken: null,
        lifecycleStatus: 'active',
        metadata,
      },
      select: { id: true },
    });

  return {
    action: existing ? 'repointed' : 'created',
    accountSelection: configuredAccountId ? 'configured' : 'sole_assigned_account',
    integrationId: integration.id,
    accountFingerprint: fingerprint(socialApiAccountId),
    pinnedAccountId: socialApiAccountId,
    next: [
      `Set SOCIALAPI_PINNED_INTEGRATION_ID=${integration.id} on the gateway.`,
      'Set SOCIALAPI_PINNED_ACCOUNT_ID to the pinnedAccountId above on the gateway.',
    ],
  };
}

export async function main(
  argv: string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const command = parseCommand(argv);
  const api = createSocialApiClient({
    apiKey: requiredEnv('SOCIALAPI_API_KEY', env),
    baseUrl: optionalEnv('SOCIALAPI_BASE_URL', env),
  });

  if (command === 'pin') {
    requireExecute(argv);
    console.log(JSON.stringify(await pinIntegration(api, env, argv), null, 2));
    return;
  }

  if (command === 'inspect') {
    console.log(JSON.stringify(await inspect(
      api,
      env,
      argv.includes('--use-sole-account'),
      argv.includes('--use-newest-conversation'),
    ), null, 2));
    return;
  }

  requireExecute(argv);
  if (command === 'connect') {
    const result = unwrap('connect initiation', await api.beginInstagramConnect({
      brandId: requiredEnv('SOCIALAPI_BRAND_ID', env),
      redirectUri: requiredEnv('SOCIALAPI_REDIRECT_URI', env),
    }));
    console.log(JSON.stringify({
      authUrl: result.authUrl,
      state: result.state,
      warning: 'The URL and state are short-lived secrets; do not paste them into evidence artifacts.',
    }, null, 2));
    return;
  }

  if (command === 'exchange') {
    const result = unwrap('OAuth exchange', await api.exchangeInstagramCode({
      code: requiredEnv('SOCIALAPI_OAUTH_CODE', env),
      redirectUri: requiredEnv('SOCIALAPI_REDIRECT_URI', env),
      state: requiredEnv('SOCIALAPI_OAUTH_STATE', env),
    }));
    console.log(JSON.stringify({
      accountId: fingerprint(result.accountId),
      platform: result.platform,
      usernamePresent: result.username.length > 0,
    }, null, 2));
    return;
  }

  if (command === 'send') {
    const text = requiredEnv('SOCIALAPI_REPLY_TEXT', env);
    if (!text.startsWith(CONTROLLED_REPLY_PREFIX)) {
      throw new Error(`SOCIALAPI_REPLY_TEXT must start with ${JSON.stringify(CONTROLLED_REPLY_PREFIX)}`);
    }
    const route = await resolveControlledReplyRoute(api, env, argv);
    const result = unwrap('controlled reply', await api.sendInstagramText({
      accountId: route.accountId,
      conversationId: route.conversationId,
      text,
    }));
    const observed = await api.listConversationMessages({
      conversationId: route.conversationId,
      limit: 5,
    });
    console.log(JSON.stringify({
      messageId: fingerprint(result.messageId),
      messageIds: result.messageIds.map(fingerprint),
      readAfterWrite: observed.ok ? {
        newestDirection: observed.data.data[0]?.direction ?? null,
        sendIdMatchesInboxId: observed.data.data.some(message => result.messageIds.includes(message.id)),
        sendIdMatchesPlatformId: observed.data.data.some(
          message => result.messageIds.includes(message.platformId),
        ),
      } : {
        errorCategory: observed.error.category,
        httpStatus: observed.error.httpStatus,
      },
    }, null, 2));
    return;
  }

  if (!argv.includes('--confirm-controlled-account')) {
    throw new Error('Disconnect also requires --confirm-controlled-account.');
  }
  const accountId = requiredEnv('SOCIALAPI_ACCOUNT_ID', env);
  unwrap('controlled disconnect', await api.disconnectInstagramAccount(accountId));
  console.log(JSON.stringify({ disconnectedAccountId: fingerprint(accountId) }, null, 2));
}

const entryPath = process.argv[1];
if (entryPath && import.meta.url === pathToFileURL(entryPath).href) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
