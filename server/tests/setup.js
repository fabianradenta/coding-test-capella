import { testDatabaseUrl } from './env.js';

// The pool reads DATABASE_URL when it is imported, so this has to run first.
process.env.DATABASE_URL = testDatabaseUrl();
