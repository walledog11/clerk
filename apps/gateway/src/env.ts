import logger from './logger.js';

const REQUIRED_ENV = [
  'DATABASE_URL',
  'REDIS_URL',
  'ANTHROPIC_API_KEY',
  'INTERNAL_API_SECRET',
  'META_APP_SECRET',
] as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[Gateway] Missing required environment variable: ${name}`);
  }
  return value;
}

export function getGatewayDashboardUrl(): string {
  const url = process.env.DASHBOARD_URL ?? process.env.DASHBOARD_INTERNAL_URL;
  if (!url) {
    throw new Error('[Gateway] Missing required environment variable: DASHBOARD_URL');
  }
  return url;
}

export function validateGatewayEnv(): void {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`[Gateway] Missing required environment variables: ${missing.join(', ')}`);
  }

  getGatewayDashboardUrl();

  const dbUrl = requireEnv('DATABASE_URL');
  if (!dbUrl.includes('pgbouncer=true')) {
    logger.warn('[Gateway] DATABASE_URL is missing pgbouncer=true — add it to avoid connection exhaustion in production');
  }
  if (!dbUrl.includes('connection_limit=')) {
    logger.warn('[Gateway] DATABASE_URL is missing connection_limit — add it (e.g. connection_limit=1) to avoid connection exhaustion in production');
  }

  if (process.env.NODE_ENV === 'production' && process.env.DASHBOARD_INTERNAL_URL) {
    logger.warn('[Gateway] DASHBOARD_INTERNAL_URL is set in production. Prefer DASHBOARD_URL and reserve DASHBOARD_INTERNAL_URL for local callback forwarding.');
  }
}

