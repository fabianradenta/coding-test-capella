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

function mapApplicationWithCustomer(row) {
  return {
    ...mapApplication(row),
    customerName: row.customer_name,
    identityNumber: row.identity_number,
  };
}

// % and _ are LIKE wildcards; a typed one has to match literally.
function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}

function buildFilters({ search, type }) {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${escapeLikePattern(search)}%`);
    conditions.push(
      `(c.name ILIKE $${values.length} OR c.identity_number ILIKE $${values.length})`,
    );
  }

  if (type) {
    values.push(type);
    conditions.push(`a.application_type = $${values.length}`);
  }

  return { conditions, values };
}

export async function findAll({ search, status, type } = {}, db = pool) {
  const { conditions, values } = buildFilters({ search, type });

  if (status) {
    values.push(status);
    conditions.push(`a.status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT a.*, c.name AS customer_name, c.identity_number
     FROM applications a
     JOIN customers c ON c.id = a.customer_id
     ${where}
     ORDER BY a.submitted_at DESC, a.id DESC`,
    values,
  );
  return rows.map(mapApplicationWithCustomer);
}

export async function countByStatus({ search, type } = {}, db = pool) {
  const { conditions, values } = buildFilters({ search, type });
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE a.status = 'PENDING')::int AS pending,
       count(*) FILTER (WHERE a.status = 'APPROVED')::int AS approved,
       count(*) FILTER (WHERE a.status = 'REJECTED')::int AS rejected
     FROM applications a
     JOIN customers c ON c.id = a.customer_id
     ${where}`,
    values,
  );

  const row = rows[0];
  return {
    all: row.total,
    PENDING: row.pending,
    APPROVED: row.approved,
    REJECTED: row.rejected,
  };
}

export async function findById(id, db = pool) {
  const { rows } = await db.query(
    `SELECT a.*, c.name AS customer_name, c.identity_number
     FROM applications a
     JOIN customers c ON c.id = a.customer_id
     WHERE a.id = $1`,
    [id],
  );
  return rows[0] ? mapApplicationWithCustomer(rows[0]) : null;
}

export async function findByCustomerId(customerId, db = pool) {
  const { rows } = await db.query(
    `SELECT *
     FROM applications
     WHERE customer_id = $1
     ORDER BY submitted_at DESC, id DESC`,
    [customerId],
  );
  return rows.map(mapApplication);
}

export async function findByIdForUpdate(id, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM applications WHERE id = $1 FOR UPDATE',
    [id],
  );
  return rows[0] ? mapApplication(rows[0]) : null;
}

export async function update(id, application, db = pool) {
  const { rows } = await db.query(
    `WITH updated AS (
       UPDATE applications
       SET application_type = $2,
           requested_amount = $3,
           tenor = $4,
           monthly_income = $5,
           notes = $6,
           monthly_payment = $7
       WHERE id = $1
       RETURNING *
     )
     SELECT u.*, c.name AS customer_name, c.identity_number
     FROM updated u
     JOIN customers c ON c.id = u.customer_id`,
    [
      id,
      application.applicationType,
      application.requestedAmount,
      application.tenor,
      application.monthlyIncome,
      application.notes,
      application.monthlyPayment,
    ],
  );
  return mapApplicationWithCustomer(rows[0]);
}

export async function updateStatus(id, status, db = pool) {
  const { rows } = await db.query(
    `WITH updated AS (
       UPDATE applications SET status = $2 WHERE id = $1 RETURNING *
     )
     SELECT u.*, c.name AS customer_name, c.identity_number
     FROM updated u
     JOIN customers c ON c.id = u.customer_id`,
    [id, status],
  );
  return mapApplicationWithCustomer(rows[0]);
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
