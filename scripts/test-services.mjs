import { pathToFileURL } from 'node:url';
import { detectDockerCompose, getTestServiceTargets, runCommand, waitForAllTestServices } from './test-infra.mjs';

const COMPOSE_FILE = 'docker-compose.test.yml';

async function main() {
  const action = process.argv[2] ?? 'status';

  switch (action) {
    case 'up':
      await up();
      return;
    case 'down':
      await down();
      return;
    case 'status':
      await status();
      return;
    default:
      throw new Error(`[test-services] Unknown action "${action}". Use up, down, or status.`);
  }
}

async function up() {
  const { command, baseArgs } = detectDockerCompose();
  await runCommand(command, [...baseArgs, '-f', COMPOSE_FILE, 'up', '-d', 'postgres', 'redis'], {
    env: process.env,
  });
  await waitForAllTestServices(process.env);

  const targets = getTestServiceTargets(process.env);
  console.log(`[test-services] Postgres ready at ${targets.postgres.host}:${targets.postgres.port}`);
  console.log(`[test-services] Redis ready at ${targets.redis.host}:${targets.redis.port}`);
}

async function down() {
  const { command, baseArgs } = detectDockerCompose();
  await runCommand(command, [...baseArgs, '-f', COMPOSE_FILE, 'down', '--remove-orphans'], {
    env: process.env,
  });
}

async function status() {
  const { command, baseArgs } = detectDockerCompose();
  await runCommand(command, [...baseArgs, '-f', COMPOSE_FILE, 'ps'], {
    env: process.env,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
