import { existsSync } from 'node:fs';

export function testDatabaseUrl() {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is not set');
  }
  // Tests truncate every table, so pointing them at the development database would wipe it.
  if (url === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must differ from DATABASE_URL');
  }

  return url;
}
