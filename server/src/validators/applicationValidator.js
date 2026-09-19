import { z } from 'zod';
import { ValidationError } from '../errors.js';

const identityNumber = z
  .string({ error: 'Nomor identitas wajib diisi' })
  .trim()
  .min(1, 'Nomor identitas wajib diisi')
  .regex(/^\d{16}$/, 'Nomor identitas harus 16 digit angka');

const name = z
  .string({ error: 'Nama lengkap wajib diisi' })
  .trim()
  .min(1, 'Nama lengkap wajib diisi')
  .max(100, 'Nama lengkap maksimal 100 karakter');

const applicationType = z.enum(['MOTORCYCLE', 'CAR', 'MULTIPURPOSE'], {
  error: 'Tipe pengajuan tidak valid',
});

const requestedAmount = z
  .int({ error: 'Nominal pengajuan harus lebih dari 0' })
  .positive('Nominal pengajuan harus lebih dari 0');

const tenor = z
  .int({ error: 'Tenor minimal 1 bulan' })
  .min(1, 'Tenor minimal 1 bulan');

const monthlyIncome = z
  .int({ error: 'Pendapatan bulanan wajib diisi' })
  .min(0, 'Pendapatan bulanan wajib diisi');

const notes = z
  .string({ error: 'Catatan wajib diisi' })
  .trim()
  .min(1, 'Catatan wajib diisi');

const applicationFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['PENDING', 'APPROVED', 'REJECTED'], { error: 'Status tidak valid' })
    .optional(),
  type: applicationType.optional(),
});

const createApplicationSchema = z.object({
  identityNumber,
  name,
  applicationType,
  requestedAmount,
  tenor,
  monthlyIncome,
  notes,
});

const updateApplicationSchema = createApplicationSchema.omit({
  identityNumber: true,
  name: true,
});

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (result.success) {
    return result.data;
  }

  // One message per field: the first check that failed is the most specific one.
  const fields = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field !== undefined && !(field in fields)) {
      fields[field] = issue.message;
    }
  }

  throw new ValidationError(fields);
}

export function parseCreateApplication(body) {
  return parse(createApplicationSchema, body);
}

export function parseUpdateApplication(body) {
  return parse(updateApplicationSchema, body);
}

export function parseApplicationFilters(query) {
  const provided = {};
  for (const key of ['search', 'status', 'type']) {
    const value = query[key];
    if (typeof value === 'string' && value.trim() !== '') {
      provided[key] = value.trim();
    }
  }
  return parse(applicationFiltersSchema, provided);
}
