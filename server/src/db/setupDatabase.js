import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const dbDir = dirname(fileURLToPath(import.meta.url));

async function createDatabaseIfMissing(connectionString) {
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
}

export async function setupDatabase({ connectionString, withSeed }) {
  await createDatabaseIfMissing(connectionString);

  const files = ['schema.sql'];
  if (withSeed) {
    files.push('seed.sql');
  }

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    for (const file of files) {
      await client.query(await readFile(join(dbDir, file), 'utf8'));
    }
  } finally {
    await client.end();
  }
}
