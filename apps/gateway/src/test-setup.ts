import { config } from 'dotenv';
config({ path: '.env' });

// Fallback values for CI where no .env file exists.
// Values must match the ?? fallbacks in test files so HMAC signatures align.
const TEST_DEFAULTS: Record<string, string> = {
  META_APP_SECRET: 'test-meta-secret',
  META_VERIFY_TOKEN: 'test-verify-token',
  INTERNAL_API_SECRET: 'test-internal-secret',
  REDIS_URL: 'redis://localhost:6379',
  ANTHROPIC_API_KEY: 'test-anthropic-key',
  DASHBOARD_INTERNAL_URL: 'http://localhost:3000',
  TWILIO_AUTH_TOKEN: 'test-twilio-token',
  TWILIO_ACCOUNT_SID: 'ACtest',
  SHOPIFY_APP_SECRET: 'test-shopify-secret',
};

for (const [key, value] of Object.entries(TEST_DEFAULTS)) {
  if (!process.env[key]) process.env[key] = value;
}
