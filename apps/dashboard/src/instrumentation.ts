import * as Sentry from '@sentry/nextjs';
import { validateDashboardEnv } from '@/lib/env';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.SENTRY_DSN) {
      Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'production' });
    }

    validateDashboardEnv();

    const dns = await import('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
}
