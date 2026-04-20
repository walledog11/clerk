import { pathToFileURL } from 'node:url';
import { runCommand } from './test-infra.mjs';

async function main() {
  await runCommand('node', ['./scripts/test-services.mjs', 'up'], { env: process.env });
  await runCommand('npm', ['run', 'test:integration'], { env: process.env });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
