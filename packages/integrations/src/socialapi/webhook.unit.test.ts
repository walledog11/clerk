import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifySocialApiWebhookV2 } from './webhook.js';

const secret = 'webhook-secret';
const timestamp = '1789002000';
const nowMs = 1_789_002_000_000;
const rawBody = Buffer.from('{"event":"dm.received","data":{"id":"sapi_dm_1"}}');

function signature(body = rawBody, sentAt = timestamp): string {
  return `sha256=${createHmac('sha256', secret).update(`${sentAt}.`).update(body).digest('hex')}`;
}

describe('SocialAPI V2 webhook verification', () => {
  it('accepts an exact signed raw body inside the replay window', () => {
    expect(verifySocialApiWebhookV2({
      secret,
      rawBody,
      signatureV2: signature(),
      timestamp,
      nowMs,
    })).toEqual({ ok: true, timestampSeconds: Number(timestamp) });
  });

  it('rejects a body changed after signing', () => {
    expect(verifySocialApiWebhookV2({
      secret,
      rawBody: Buffer.from('{"event":"dm.sent"}'),
      signatureV2: signature(),
      timestamp,
      nowMs,
    })).toEqual({ ok: false, reason: 'invalid' });
  });

  it.each([
    [null, timestamp, 'missing'],
    [signature(), null, 'missing'],
    ['not-a-signature', timestamp, 'malformed'],
    [`sha256=${'z'.repeat(64)}`, timestamp, 'malformed'],
    [signature(), 'today', 'malformed'],
  ] as const)('rejects invalid header pair %#', (signatureV2, sentAt, reason) => {
    expect(verifySocialApiWebhookV2({
      secret,
      rawBody,
      signatureV2,
      timestamp: sentAt,
      nowMs,
    })).toEqual({ ok: false, reason });
  });

  it.each([-301_000, 301_000])('rejects delivery outside the past/future tolerance (%sms)', offset => {
    expect(verifySocialApiWebhookV2({
      secret,
      rawBody,
      signatureV2: signature(),
      timestamp,
      nowMs: nowMs + offset,
    })).toEqual({ ok: false, reason: 'stale' });
  });

  it('does not treat an unsigned registration ping as verified', () => {
    expect(verifySocialApiWebhookV2({
      secret,
      rawBody: Buffer.from('{"event":"webhook.test"}'),
      signatureV2: null,
      timestamp: null,
      nowMs,
    })).toEqual({ ok: false, reason: 'missing' });
  });
});
