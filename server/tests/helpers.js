import { pool } from '../src/db/pool.js';

export async function resetDatabase() {
  await pool.query('TRUNCATE applications, customers');
}

export function validPayload(overrides = {}) {
  return {
    identityNumber: '3201014405900001',
    name: 'Siti Aminah',
    applicationType: 'CAR',
    requestedAmount: 120000000,
    tenor: 24,
    monthlyIncome: 7500000,
    notes: 'Kendaraan untuk usaha',
    ...overrides,
  };
}

export async function setStatus(id, status) {
  await pool.query('UPDATE applications SET status = $1 WHERE id = $2', [
    status,
    id,
  ]);
}

export async function setSubmittedAt(id, submittedAt) {
  await pool.query('UPDATE applications SET submitted_at = $1 WHERE id = $2', [
    submittedAt,
    id,
  ]);
}
