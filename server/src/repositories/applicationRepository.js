import { pool } from '../db/pool.js';

// pg returns NUMERIC as strings; every amount here stays well below Number.MAX_SAFE_INTEGER.
export function mapApplication(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    applicationType: row.application_type,
    requestedAmount: Number(row.requested_amount),
    tenor: row.tenor,
    monthlyIncome: Number(row.monthly_income),
    notes: row.notes,
    monthlyPayment: Number(row.monthly_payment),
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

export async function countActiveByCustomerId(customerId, db = pool) {
  const { rows } = await db.query(
    `SELECT count(*)::int AS count
     FROM applications
     WHERE customer_id = $1 AND status IN ('PENDING', 'APPROVED')`,
    [customerId],
  );
  return rows[0].count;
}

export async function insert(application, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO applications (
       customer_id, application_type, requested_amount, tenor,
       monthly_income, notes, monthly_payment
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      application.customerId,
      application.applicationType,
      application.requestedAmount,
      application.tenor,
      application.monthlyIncome,
      application.notes,
      application.monthlyPayment,
    ],
  );
  return mapApplication(rows[0]);
}
