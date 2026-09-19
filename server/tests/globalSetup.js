import { setupDatabase } from '../src/db/setupDatabase.js';
import { testDatabaseUrl } from './env.js';

export async function setup() {
  await setupDatabase({
    connectionString: testDatabaseUrl(),
    withSeed: false,
  });
}
