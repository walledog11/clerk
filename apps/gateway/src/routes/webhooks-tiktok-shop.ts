import type { Request, Response, Router } from 'express';
import { randomUUID, createHash } from 'crypto';
import { db } from '@shopkeeper/db';
import { getTikTokShopWebhookConfig } from '../config/runtime-config.js';
import {
  normalizeTikTokShopWebhookMessages,
  verifyTikTokShopWebhookSignature,
} from '../clients/tiktok-shop.js';
import logger from '../logger.js';
import { CHANNEL, JOB } from '../constants.js';
import { rateLimit, sendTooManyRequests } from '../rate-limit.js';
import { webhookJsonParser } from './body-parsers.js';
import { getMessageQueue, getRateLimitRedis } from './webhooks-shared.js';
import {
  buildWebhookSignatureRequestMetadata,
  recordWebhookSignatureFailure,
} from './webhooks-signature-alerts.js';

export function registerTikTokShopWebhookRoutes(router: Router): void {
  router.post('/tiktok-shop', webhookJsonParser(), async (req: Request, res: Response) => {
    const config = getTikTokShopWebhookConfig();
    if (!config.enabled) {
      return res.sendStatus(404);
    }
    if (!config.secret) {
      logger.error('[Webhook] TIKTOK_SHOP_WEBHOOK_SECRET is not configured — rejecting.');
      return res.sendStatus(500);
    }

    const signatureHeader = req.headers[config.signatureHeader];
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    if (!signature || !req.rawBody) {
      logger.warn('[Webhook] TikTok Shop missing signature or raw body — rejecting.');
      recordWebhookSignatureFailure(
        'tiktok_shop',
        !signature ? 'missing_signature' : 'missing_raw_body',
        {
          counterClient: getRateLimitRedis(),
          route: '/webhooks/tiktok-shop',
          request: buildWebhookSignatureRequestMetadata(req),
        },
      ).catch((err) => logger.error({ err }, '[Webhook] TikTok Shop signature alert error'));
      return res.sendStatus(401);
    }

    if (!verifyTikTokShopWebhookSignature({ body: req.rawBody, config, signature })) {
      logger.warn('[Webhook] TikTok Shop signature mismatch — rejecting.');
      recordWebhookSignatureFailure(
        'tiktok_shop',
        'signature_mismatch',
        {
          counterClient: getRateLimitRedis(),
          route: '/webhooks/tiktok-shop',
          request: buildWebhookSignatureRequestMetadata(req),
        },
      ).catch((err) => logger.error({ err }, '[Webhook] TikTok Shop signature alert error'));
      return res.sendStatus(401);
    }

    const messages = normalizeTikTokShopWebhookMessages(req.body, config.messageEventNames).filter(message => !message.isEcho);
    if (messages.length === 0) {
      logger.info('[Webhook] TikTok Shop non-buyer-message event — skipping queue.');
      return res.status(200).send('OK');
    }

    try {
      for (const message of messages) {
        const integration = await db.integration.findFirst({
          where: { platform: CHANNEL.TIKTOK, externalAccountId: message.accountId, lifecycleStatus: 'active' },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: { id: true, organizationId: true },
        });
        if (!integration) {
          logger.warn({ accountId: message.accountId }, '[Webhook] No TikTok Shop integration found — dropping.');
          continue;
        }

        const organizationId = integration.organizationId;
        const tiktokRateLimit = await rateLimit(getRateLimitRedis(), `webhook:tiktok:${organizationId}`);
        if (!tiktokRateLimit.success) {
          logger.warn({ organizationId }, '[Webhook] TikTok Shop rate limit exceeded');
          return sendTooManyRequests(res, tiktokRateLimit.reset);
        }

        const traceId = randomUUID();
        await getMessageQueue().add(JOB.TIKTOK_SHOP, {
          platform: CHANNEL.TIKTOK,
          organizationId,
          integrationId: integration.id,
          tiktokMessage: message,
          inboundMessageId: message.messageId ? `tiktok:${message.accountId}:${message.messageId}` : null,
          traceId,
        }, message.messageId ? { jobId: createHash("sha256").update(`${integration.id}:${message.messageId}`).digest("hex") } : undefined);

        logger.info({ organizationId, traceId }, '[Webhook] TikTok Shop buyer message queued');
      }
      return res.status(200).send('OK');
    } catch (error) {
      logger.error({ err: error }, '[Webhook] Failed to queue TikTok Shop message');
      return res.sendStatus(500);
    }
  });
}
