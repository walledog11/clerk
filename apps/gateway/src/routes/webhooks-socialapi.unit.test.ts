import { createHmac } from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRegisteredWebhookRouterApp } from '../test-fixtures/webhook-route-test-helpers.js';

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../logger.js', () => ({ default: mockLogger }));
vi.mock('./webhooks-shared.js', () => ({
  getRateLimitRedis: () => ({
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  }),
}));

import { registerSocialApiWebhookRoutes } from './webhooks-socialapi.js';

const SECRET = 'test-socialapi-webhook-secret';
const app = createRegisteredWebhookRouterApp(registerSocialApiWebhookRoutes);

function signedRequest(body: string, timestamp = `${Math.floor(Date.now() / 1_000)}`) {
  const signature = `sha256=${createHmac('sha256', SECRET)
    .update(timestamp)
    .update('.')
    .update(body)
    .digest('hex')}`;
  return request(app)
    .post('/webhooks/socialapi')
    .set('Content-Type', 'application/json')
    .set('X-SocialAPI-Signature-V2', signature)
    .set('X-SocialAPI-Timestamp', timestamp);
}

describe('SocialAPI webhook spike receiver', () => {
  beforeEach(() => {
    process.env.SOCIALAPI_WEBHOOK_SECRET = SECRET;
    mockLogger.debug.mockClear();
    mockLogger.error.mockClear();
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
  });

  afterEach(() => {
    process.env.SOCIALAPI_WEBHOOK_SECRET = SECRET;
  });

  it('accepts only the strict unsigned registration ping while no secret is configured', async () => {
    delete process.env.SOCIALAPI_WEBHOOK_SECRET;

    const accepted = await request(app)
      .post('/webhooks/socialapi')
      .set('Content-Type', 'application/json')
      .set('X-SocialAPI-Event', 'webhook.test')
      .send({ event: 'webhook.test', data: {} });
    const rejected = await request(app)
      .post('/webhooks/socialapi')
      .set('Content-Type', 'application/json')
      .set('X-SocialAPI-Event', 'webhook.test')
      .send({ event: 'webhook.test', data: {}, extra: true });

    expect(accepted.status).toBe(200);
    expect(rejected.status).toBe(500);
  });

  it('rejects an unsigned real event', async () => {
    const response = await request(app)
      .post('/webhooks/socialapi')
      .set('Content-Type', 'application/json')
      .set('X-SocialAPI-Event', 'dm.received')
      .set('X-SocialAPI-Delivery', 'delivery-1')
      .send({ event: 'dm.received', data: {} });

    expect(response.status).toBe(401);
  });

  it('accepts a signed real event and logs structural, fingerprinted evidence only', async () => {
    const body = JSON.stringify({
      event: 'dm.received',
      data: {
        id: 'interaction-sensitive',
        account_id: 'account-sensitive',
        platform: 'instagram',
        author: { id: 'author-sensitive', name: 'Do not log me' },
        content: {
          text: 'Shopkeeper controlled spike secret message',
          media: [{ type: 'image', url: 'https://private.example/image' }],
        },
        received_at: '2026-09-10T01:18:38Z',
      },
      raw_payload: { secret: 'do-not-log' },
    });

    const response = await signedRequest(body)
      .set('X-SocialAPI-Event', 'dm.received')
      .set('X-SocialAPI-Delivery', 'delivery-sensitive')
      .send(body);

    expect(response.status).toBe(200);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'dm.received',
        deliveryId: expect.stringMatching(/^sha256:[a-f0-9]{16}$/),
        accountId: expect.stringMatching(/^sha256:[a-f0-9]{16}$/),
        interactionId: expect.stringMatching(/^sha256:[a-f0-9]{16}$/),
        authorId: expect.stringMatching(/^sha256:[a-f0-9]{16}$/),
        platform: 'instagram',
        textPresent: true,
        mediaCount: 1,
        rawPayloadPresent: true,
      }),
      expect.any(String),
    );
    expect(JSON.stringify(mockLogger.info.mock.calls)).not.toContain('secret message');
    expect(JSON.stringify(mockLogger.info.mock.calls)).not.toContain('private.example');
    expect(JSON.stringify(mockLogger.info.mock.calls)).not.toContain('Do not log me');
  });

  it('rejects stale signatures and signed header/body event mismatches', async () => {
    const staleBody = JSON.stringify({ event: 'dm.received', data: {} });
    const stale = await signedRequest(staleBody, '1700000000')
      .set('X-SocialAPI-Event', 'dm.received')
      .set('X-SocialAPI-Delivery', 'delivery-stale')
      .send(staleBody);

    const mismatchBody = JSON.stringify({ event: 'dm.sent', data: {} });
    const mismatch = await signedRequest(mismatchBody)
      .set('X-SocialAPI-Event', 'dm.received')
      .set('X-SocialAPI-Delivery', 'delivery-mismatch')
      .send(mismatchBody);

    expect(stale.status).toBe(401);
    expect(mismatch.status).toBe(400);
  });

  it('rejects a signed real event without a delivery ID', async () => {
    const body = JSON.stringify({ event: 'dm.sent', data: {} });
    const response = await signedRequest(body)
      .set('X-SocialAPI-Event', 'dm.sent')
      .send(body);

    expect(response.status).toBe(400);
  });

  it('mounts under the signed-webhook body limit', async () => {
    const limitedApp = express();
    limitedApp.use('/webhooks', (() => {
      const router = express.Router();
      registerSocialApiWebhookRoutes(router);
      return router;
    })());

    const response = await request(limitedApp)
      .post('/webhooks/socialapi')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ event: 'dm.received', padding: 'x'.repeat(3_000_000) }));

    expect(response.status).toBe(413);
  });
});
