import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const dbDir = dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function createDatabaseIfMissing() {
  const probe = new pg.Client({ connectionString });
  try {
    await probe.connect();
    await probe.end();
    return;
  } catch (err) {
    if (err.code !== '3D000') {
      throw err;
    }
  }

  // Connecting to the maintenance database is the only way to create the missing one.
  const url = new URL(connectionString);
  const database = decodeURIComponent(url.pathname.slice(1));
  url.pathname = '/postgres';

  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  await admin.query(`CREATE DATABASE "${database.replaceAll('"', '""')}"`);
  await admin.end();
  console.log(`Created database ${database}`);
}

async function main() {
  await createDatabaseIfMissing();

  const [schema, seed] = await Promise.all([
    readFile(join(dbDir, 'schema.sql'), 'utf8'),
    readFile(join(dbDir, 'seed.sql'), 'utf8'),
  ]);

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(schema);
    await client.query(seed);
  } finally {
    await client.end();
  }

  console.log('Database ready: schema applied and seed data inserted');
}

await main();
