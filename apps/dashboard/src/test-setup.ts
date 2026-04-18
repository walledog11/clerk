import { config } from 'dotenv';
import { vi } from 'vitest';

config({ path: '.env.local' });

// Bypass rate limiting in tests — no Redis available in CI
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 100, reset: 9999999999 }),
  tooManyRequests: vi.fn(),
}));
