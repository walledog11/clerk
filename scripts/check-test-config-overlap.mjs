import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO_ROOT = process.cwd();
const DASHBOARD_ROOT = join(REPO_ROOT, 'apps/dashboard');
const UNIT_CONFIG = join(DASHBOARD_ROOT, 'vitest.unit.config.ts');
const INTEGRATION_CONFIG = join(DASHBOARD_ROOT, 'vitest.integration.config.ts');

const unitInclude = readStringArray(UNIT_CONFIG, 'include');
const integrationInclude = readStringArray(INTEGRATION_CONFIG, 'include');
const integrationExclude = readStringArray(INTEGRATION_CONFIG, 'exclude');

const unitFiles = new Set(unitInclude.flatMap((pattern) => expandDashboardPattern(pattern)));
const integrationFiles = new Set(integrationInclude.flatMap((pattern) => expandDashboardPattern(pattern)));
const excludedFiles = new Set(integrationExclude.flatMap((pattern) => expandDashboardPattern(pattern)));
const missingConfiguredFiles = [
  ...unitInclude.filter((pattern) => isExactPath(pattern) && !existsSync(join(DASHBOARD_ROOT, pattern))),
  ...integrationExclude.filter((pattern) => isExactPath(pattern) && !existsSync(join(DASHBOARD_ROOT, pattern))),
];

for (const file of excludedFiles) {
  integrationFiles.delete(file);
}

const overlaps = [...unitFiles].filter((file) => integrationFiles.has(file)).sort();
const unitFilesNotExcluded = [...unitFiles].filter((file) => !excludedFiles.has(file)).sort();

if (missingConfiguredFiles.length > 0 || overlaps.length > 0 || unitFilesNotExcluded.length > 0) {
  console.error('Dashboard Vitest config ownership check failed.');
  console.error('Unit-owned tests must be excluded from the integration target so tests run exactly once.');

  if (missingConfiguredFiles.length > 0) {
    console.error('\nConfigured test paths do not exist:');
    for (const file of missingConfiguredFiles) {
      console.error(`- apps/dashboard/${file}`);
    }
  }

  if (overlaps.length > 0) {
    console.error('\nTests matched by both unit and integration configs:');
    for (const file of overlaps) {
      console.error(`- ${file}`);
    }
  }

  if (unitFilesNotExcluded.length > 0) {
    console.error('\nUnit-owned tests missing from integration exclude:');
    for (const file of unitFilesNotExcluded) {
      console.error(`- ${file}`);
    }
  }

  process.exit(1);
}

function readStringArray(filePath, propertyName) {
  const source = readFileSync(filePath, 'utf8');
  const propertyMatch = source.match(new RegExp(`\\b${propertyName}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!propertyMatch) {
    throw new Error(`Could not find ${propertyName} array in ${relative(REPO_ROOT, filePath)}`);
  }

  return [...propertyMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

function expandDashboardPattern(pattern) {
  if (pattern === 'src/**/*.test.ts') {
    return listFiles(join(DASHBOARD_ROOT, 'src'))
      .filter((file) => file.endsWith('.test.ts'))
      .map((file) => relative(REPO_ROOT, file));
  }

  if (!isExactPath(pattern)) {
    throw new Error(`Unsupported dashboard Vitest glob: ${pattern}`);
  }

  return [relative(REPO_ROOT, join(DASHBOARD_ROOT, pattern))];
}

function listFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  });
}

function isExactPath(pattern) {
  return !pattern.includes('*');
}
