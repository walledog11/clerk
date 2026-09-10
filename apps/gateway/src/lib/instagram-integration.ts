import { db } from '@shopkeeper/db';
import { AmbiguousInstagramIntegrationError } from '@shopkeeper/integrations/instagram';

import { isRecord } from './typing.js';
interface ActiveInstagramIntegrationBase {
  id: string;
  organizationId: string;
  instagramAccountId: string;
}

export interface ActiveMetaDirectIntegration extends ActiveInstagramIntegrationBase {
  transport: 'meta_direct';
  accessToken: string;
}

export interface ActiveSocialApiIntegration extends ActiveInstagramIntegrationBase {
  transport: 'socialapi';
  accessToken: null;
}

export type ActiveInstagramIntegration =
  | ActiveMetaDirectIntegration
  | ActiveSocialApiIntegration;

function isInstagramLoginMetadata(metadata: unknown): boolean {
  if (!isRecord(metadata) || !isRecord(metadata.instagram)) return false;
  return metadata.instagram.authModel === 'instagram_login';
}

// Records written before the transport field existed are direct Meta; the field
// is only ever read, never inferred from the row's current credentials.
function isSocialApiMetadata(metadata: unknown): boolean {
  if (!isRecord(metadata) || !isRecord(metadata.instagram)) return false;
  return metadata.instagram.transport === 'socialapi';
}

function toActiveInstagramIntegration(
  integration: {
    accessToken: string | null;
    externalAccountId: string;
    id: string;
    metadata: unknown;
    organizationId: string;
  },
): ActiveMetaDirectIntegration | null {
  if (!integration.accessToken || !isInstagramLoginMetadata(integration.metadata)) return null;
  return {
    transport: 'meta_direct',
    id: integration.id,
    organizationId: integration.organizationId,
    instagramAccountId: integration.externalAccountId,
    accessToken: integration.accessToken,
  };
}

const activeInstagramSelect = {
  accessToken: true,
  externalAccountId: true,
  id: true,
  metadata: true,
  organizationId: true,
} as const;

// Direct Meta ingress resolves direct Meta rows only. A SocialAPI row must never
// be reachable from a Meta-signed webhook: the two transports observe different
// Meta apps and their sender identities are not interchangeable.
export async function resolveActiveInstagramIntegration(
  instagramAccountId: string,
): Promise<ActiveMetaDirectIntegration | null> {
  const integrations = await db.integration.findMany({
    where: {
      platform: 'ig_dm',
      externalAccountId: instagramAccountId,
      lifecycleStatus: 'active',
    },
    select: activeInstagramSelect,
    take: 2,
  });

  if (integrations.length > 1) {
    throw new AmbiguousInstagramIntegrationError(
      `Instagram account ${instagramAccountId} resolves to multiple active integrations`,
    );
  }

  return integrations[0] ? toActiveInstagramIntegration(integrations[0]) : null;
}

export async function loadActiveInstagramIntegration(input: {
  id: string;
  instagramAccountId: string;
  organizationId: string;
  transport?: 'meta_direct' | 'socialapi';
}): Promise<ActiveInstagramIntegration | null> {
  const integration = await db.integration.findFirst({
    where: {
      id: input.id,
      organizationId: input.organizationId,
      platform: 'ig_dm',
      externalAccountId: input.instagramAccountId,
      lifecycleStatus: 'active',
    },
    select: activeInstagramSelect,
  });
  if (!integration) return null;

  if (input.transport === 'socialapi') {
    return isSocialApiMetadata(integration.metadata)
      ? {
        transport: 'socialapi',
        id: integration.id,
        organizationId: integration.organizationId,
        instagramAccountId: integration.externalAccountId,
        accessToken: null,
      }
      : null;
  }

  return toActiveInstagramIntegration(integration);
}

// Provider ingress resolves provider-fronted rows only, keyed on the provider's
// own account id. The organization is always read from the row that matches:
// a webhook never names the workspace it belongs to.
export async function resolveSocialApiIntegration(
  providerAccountId: string,
): Promise<ActiveSocialApiIntegration | null> {
  const integrations = await db.integration.findMany({
    where: {
      platform: 'ig_dm',
      providerAccountId,
      lifecycleStatus: 'active',
    },
    select: activeInstagramSelect,
    take: 2,
  });

  if (integrations.length > 1) {
    throw new AmbiguousInstagramIntegrationError(
      `SocialAPI account ${providerAccountId} resolves to multiple active integrations`,
    );
  }

  const integration = integrations[0];
  if (!integration || !isSocialApiMetadata(integration.metadata)) return null;
  return {
    transport: 'socialapi',
    id: integration.id,
    organizationId: integration.organizationId,
    instagramAccountId: integration.externalAccountId,
    accessToken: null,
  };
}
