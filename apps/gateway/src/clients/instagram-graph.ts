import { createHash } from 'node:crypto';
import {
  fetchConnectedInstagramAccount,
  fetchInstagramMessageSubscription as fetchInstagramMessageSubscriptionShared,
  fetchInstagramMessagingUserProfile as fetchInstagramMessagingUserProfileShared,
  refreshInstagramAccessToken,
  type InstagramGraphResult,
  type InstagramMessageSubscription,
  type InstagramProviderError,
} from '@shopkeeper/integrations/instagram';

export {
  fetchConnectedInstagramAccount,
  refreshInstagramAccessToken,
  type InstagramProviderError,
};

export function fetchInstagramMessageSubscription(
  instagramAccountId: string,
  accessToken: string,
): Promise<InstagramGraphResult<InstagramMessageSubscription>> {
  return fetchInstagramMessageSubscriptionShared({
    accountId: instagramAccountId,
    accessToken,
  });
}

const profileCache = new Map<string, { expiresAt: number; result: ReturnType<typeof fetchInstagramMessagingUserProfileShared> }>();

export function fetchInstagramMessagingUserProfile(senderId: string, accessToken: string) {
  const key = createHash('sha256').update(accessToken).update('\0').update(senderId).digest('hex');
  const cached = profileCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  if (profileCache.size >= 1_000) profileCache.delete(profileCache.keys().next().value!);
  const result = fetchInstagramMessagingUserProfileShared(senderId, accessToken);
  const entry = { expiresAt: Date.now() + 10 * 60_000, result };
  profileCache.set(key, entry);
  void result.then(response => {
    if (!response.ok && profileCache.get(key) === entry) profileCache.delete(key);
  }, () => {
    if (profileCache.get(key) === entry) profileCache.delete(key);
  });
  return result;
}
