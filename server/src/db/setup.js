import { setupDatabase } from './setupDatabase.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

await setupDatabase({ connectionString, withSeed: true });
console.log('Database ready: schema applied and seed data inserted');
