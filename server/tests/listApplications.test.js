import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';
import {
  resetDatabase,
  setStatus,
  setSubmittedAt,
  validPayload,
} from './helpers.js';

const app = createApp();

afterAll(() => pool.end());

beforeEach(async () => {
  await resetDatabase();

  const rows = [
    {
      payload: {
        identityNumber: '3201014405900001',
        name: 'Siti Aminah',
        applicationType: 'CAR',
      },
      status: 'PENDING',
      submittedAt: '2026-09-18T03:00:00Z',
    },
    {
      payload: {
        identityNumber: '3273051209880002',
        name: 'Budi Santoso',
        applicationType: 'MOTORCYCLE',
      },
      status: 'APPROVED',
      submittedAt: '2026-09-17T03:00:00Z',
    },
    {
      payload: {
        identityNumber: '3174045511930004',
        name: 'Dewi Lestari',
        applicationType: 'MULTIPURPOSE',
      },
      status: 'REJECTED',
      submittedAt: '2026-09-16T03:00:00Z',
    },
  ];

  for (const row of rows) {
    const created = await request(app)
      .post('/api/applications')
      .send(validPayload(row.payload));
    await setStatus(created.body.id, row.status);
    await setSubmittedAt(created.body.id, row.submittedAt);
  }
});

async function list(query = '') {
  return request(app).get(`/api/applications${query}`);
}

describe('GET /api/applications', () => {
  it('returns every application newest first', async () => {
    const response = await list();

    expect(response.status).toBe(200);
    expect(response.body.items.map((item) => item.customerName)).toEqual([
      'Siti Aminah',
      'Budi Santoso',
      'Dewi Lestari',
    ]);
    expect(response.body.counts).toEqual({
      all: 3,
      PENDING: 1,
      APPROVED: 1,
      REJECTED: 1,
    });
  });

  it('filters by status while keeping the counts of the other statuses', async () => {
    const response = await list('?status=APPROVED');

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].customerName).toBe('Budi Santoso');
    expect(response.body.counts).toEqual({
      all: 3,
      PENDING: 1,
      APPROVED: 1,
      REJECTED: 1,
    });
  });

  it('searches part of a name regardless of case', async () => {
    const response = await list('?search=sIt');

    expect(response.body.items.map((item) => item.customerName)).toEqual([
      'Siti Aminah',
    ]);
  });

  it('searches part of an identity number', async () => {
    const response = await list('?search=31740');

    expect(response.body.items.map((item) => item.customerName)).toEqual([
      'Dewi Lestari',
    ]);
  });

  it('narrows the counts to what the search and type filters match', async () => {
    const response = await list('?type=CAR');

    expect(response.body.items).toHaveLength(1);
    expect(response.body.counts).toEqual({
      all: 1,
      PENDING: 1,
      APPROVED: 0,
      REJECTED: 0,
    });
  });

  it('combines search, status and type', async () => {
    const match = await list('?search=budi&status=APPROVED&type=MOTORCYCLE');
    const mismatch = await list('?search=budi&status=PENDING');

    expect(match.body.items).toHaveLength(1);
    expect(mismatch.body.items).toHaveLength(0);
  });

  it('treats wildcard characters in the search as plain text', async () => {
    const response = await list('?search=%25');

    expect(response.body.items).toHaveLength(0);
  });

  it('refuses an unknown status filter', async () => {
    const response = await list('?status=BATAL');

    expect(response.status).toBe(422);
    expect(response.body.error.fields).toEqual({
      status: 'Status tidak valid',
    });
  });
});
