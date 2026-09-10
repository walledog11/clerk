import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_PATTERN = /^sha256=([a-f0-9]{64})$/i;
const TIMESTAMP_PATTERN = /^\d{10,}$/;

export type SocialApiWebhookVerification =
  | { ok: true; timestampSeconds: number }
  | { ok: false; reason: 'missing' | 'malformed' | 'stale' | 'invalid' };

export interface VerifySocialApiWebhookInput {
  secret: string;
  rawBody: Uint8Array;
  signatureV2: string | null | undefined;
  timestamp: string | null | undefined;
  nowMs?: number;
  toleranceMs?: number;
}

/**
 * Verifies SocialAPI's replay-protected signature over `<timestamp>.<raw body>`.
 * The initial unsigned registration ping is deliberately not handled here; only
 * the HTTP route can apply that narrow exception after validating its event and body.
 */
export function verifySocialApiWebhookV2(
  input: VerifySocialApiWebhookInput,
): SocialApiWebhookVerification {
  if (!input.signatureV2 || !input.timestamp) return { ok: false, reason: 'missing' };
  const signatureMatch = SIGNATURE_PATTERN.exec(input.signatureV2);
  if (!signatureMatch || !TIMESTAMP_PATTERN.test(input.timestamp)) {
    return { ok: false, reason: 'malformed' };
  }

  const timestampSeconds = Number(input.timestamp);
  if (!Number.isSafeInteger(timestampSeconds)) return { ok: false, reason: 'malformed' };
  const nowMs = input.nowMs ?? Date.now();
  const toleranceMs = input.toleranceMs ?? 5 * 60 * 1_000;
  if (!Number.isFinite(toleranceMs) || toleranceMs < 0) {
    throw new Error('SocialAPI webhook tolerance must be a non-negative finite number');
  }
  if (Math.abs(nowMs - timestampSeconds * 1_000) > toleranceMs) {
    return { ok: false, reason: 'stale' };
  }

  const expected = createHmac('sha256', input.secret)
    .update(input.timestamp)
    .update('.')
    .update(input.rawBody)
    .digest();
  const received = Buffer.from(signatureMatch[1]!, 'hex');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, timestampSeconds };
}
