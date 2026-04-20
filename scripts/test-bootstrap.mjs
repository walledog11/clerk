import { pathToFileURL } from 'node:url';
import { runCommand, waitForAllTestServices } from './test-infra.mjs';

async function main() {
  await runCommand('npm', ['run', 'build', '-w', 'packages/db']);

  try {
    await waitForAllTestServices(process.env);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}\n[test-bootstrap] Start local test services with: npm run test:services:up`);
  }

  await runCommand('npx', ['prisma', 'migrate', 'deploy', '--schema=packages/db/prisma/schema.prisma']);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
