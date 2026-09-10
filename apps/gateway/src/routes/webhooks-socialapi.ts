import { createHash } from 'node:crypto';
import type { Request, Response, Router } from 'express';
import { verifySocialApiWebhookV2 } from '@shopkeeper/integrations/socialapi';
import { getSocialApiWebhookConfig } from '../config/runtime-config.js';
import logger from '../logger.js';
import { rateLimit, sendTooManyRequests } from '../rate-limit.js';
import { webhookJsonParser } from './body-parsers.js';
import { getRateLimitRedis } from './webhooks-shared.js';
import {
  buildWebhookSignatureRequestMetadata,
  recordWebhookSignatureFailure,
  type WebhookSignatureFailureReason,
} from './webhooks-signature-alerts.js';

const ROUTE = '/webhooks/socialapi';
const REGISTRATION_PING_MAX_BYTES = 4_096;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readHeader(req: Request, name: string): string | null {
  const value = req.headers[name];
  const firstValue = Array.isArray(value) ? value[0] : value;
  return typeof firstValue === 'string' && firstValue.trim() ? firstValue.trim() : null;
}

function fingerprint(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  return `sha256:${createHash('sha256').update(value).digest('hex').slice(0, 16)}`;
}

function isUnsignedRegistrationPing(req: Request): boolean {
  if (!req.rawBody || req.rawBody.byteLength > REGISTRATION_PING_MAX_BYTES) return false;
  if (readHeader(req, 'x-socialapi-event') !== 'webhook.test') return false;
  if (!isRecord(req.body) || req.body.event !== 'webhook.test' || !isRecord(req.body.data)) {
    return false;
  }
  return Object.keys(req.body).every((key) => key === 'event' || key === 'data');
}

function signatureFailureReason(
  verificationReason: 'missing' | 'malformed' | 'stale' | 'invalid',
): WebhookSignatureFailureReason {
  return verificationReason === 'missing' ? 'missing_signature' : 'signature_mismatch';
}

function recordSignatureFailure(
  req: Request,
  reason: WebhookSignatureFailureReason,
): void {
  recordWebhookSignatureFailure('socialapi', reason, {
    counterClient: getRateLimitRedis(),
    route: ROUTE,
    request: buildWebhookSignatureRequestMetadata(req),
  }).catch((err) => logger.error({ err }, '[Webhook] SocialAPI signature alert error'));
}

function summarizePayload(body: unknown, deliveryId: string, event: string) {
  const payload = isRecord(body) ? body : {};
  const data = isRecord(payload.data) ? payload.data : {};
  const author = isRecord(data.author) ? data.author : {};
  const content = isRecord(data.content) ? data.content : {};
  const media = Array.isArray(content.media) ? content.media : [];

  return {
    event,
    deliveryId: fingerprint(deliveryId),
    accountId: fingerprint(data.account_id),
    interactionId: fingerprint(data.id),
    authorId: fingerprint(author.id),
    platform: typeof data.platform === 'string' ? data.platform : null,
    textPresent: typeof content.text === 'string' && content.text.length > 0,
    mediaCount: media.length,
    receivedAt: typeof data.received_at === 'string' ? data.received_at : null,
    rawPayloadPresent: Object.hasOwn(payload, 'raw_payload'),
  };
}

export function registerSocialApiWebhookRoutes(router: Router): void {
  router.post('/socialapi', webhookJsonParser(), async (req: Request, res: Response) => {
    const { secret } = getSocialApiWebhookConfig();

    // SocialAPI verifies a new endpoint before revealing its secret. This is a
    // deployment-time, fail-closed gate: after the secret is installed, even
    // webhook.test deliveries must carry a valid V2 signature.
    if (!secret) {
      if (isUnsignedRegistrationPing(req)) {
        const source = fingerprint(req.ip) ?? 'unknown';
        const registrationRateLimit = await rateLimit(
          getRateLimitRedis(),
          `webhook:socialapi:registration:${source}`,
          10,
          60,
        );
        if (!registrationRateLimit.success) {
          logger.warn('[Webhook] SocialAPI registration ping rate limit exceeded');
          sendTooManyRequests(res, registrationRateLimit.reset);
          return;
        }
        logger.info('[Webhook] Accepted SocialAPI endpoint registration ping');
        return res.sendStatus(200);
      }
      logger.error('[Webhook] SOCIALAPI_WEBHOOK_SECRET is not configured — rejecting.');
      return res.sendStatus(500);
    }

    if (!req.rawBody) {
      recordSignatureFailure(req, 'missing_raw_body');
      return res.sendStatus(401);
    }

    const verification = verifySocialApiWebhookV2({
      secret,
      rawBody: req.rawBody,
      signatureV2: readHeader(req, 'x-socialapi-signature-v2'),
      timestamp: readHeader(req, 'x-socialapi-timestamp'),
    });
    if (!verification.ok) {
      logger.warn(
        { reason: verification.reason },
        '[Webhook] SocialAPI V2 signature rejected',
      );
      recordSignatureFailure(req, signatureFailureReason(verification.reason));
      return res.sendStatus(401);
    }

    const headerEvent = readHeader(req, 'x-socialapi-event');
    const bodyEvent = isRecord(req.body) && typeof req.body.event === 'string'
      ? req.body.event
      : null;
    if (!headerEvent || !bodyEvent || headerEvent !== bodyEvent) {
      logger.warn('[Webhook] SocialAPI event header/body mismatch — rejecting.');
      return res.sendStatus(400);
    }

    const deliveryId = readHeader(req, 'x-socialapi-delivery');
    if (bodyEvent !== 'webhook.test' && !deliveryId) {
      logger.warn('[Webhook] SocialAPI real event missing delivery ID — rejecting.');
      return res.sendStatus(400);
    }

    if (deliveryId) {
      logger.info(
        summarizePayload(req.body, deliveryId, bodyEvent),
        '[Webhook] SocialAPI signed event observed during controlled spike',
      );
    } else {
      logger.info(
        { event: bodyEvent },
        '[Webhook] SocialAPI signed test delivery observed during controlled spike',
      );
    }
    return res.sendStatus(200);
  });
}
