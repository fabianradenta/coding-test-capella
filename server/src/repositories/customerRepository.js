import { pool } from '../db/pool.js';

function mapCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    identityNumber: row.identity_number,
    createdAt: row.created_at,
  };
}

export async function findByIdentityNumber(identityNumber, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM customers WHERE identity_number = $1',
    [identityNumber],
  );
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function findByIdentityNumberForUpdate(identityNumber, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM customers WHERE identity_number = $1 FOR UPDATE',
    [identityNumber],
  );
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function insertIfAbsent({ name, identityNumber }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO customers (name, identity_number)
     VALUES ($1, $2)
     ON CONFLICT (identity_number) DO NOTHING
     RETURNING *`,
    [name, identityNumber],
  );
  return rows[0] ? mapCustomer(rows[0]) : null;
}
