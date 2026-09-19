import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';
import { resetDatabase, validPayload } from './helpers.js';

const app = createApp();

const UNKNOWN_ID = '11111111-2222-3333-4444-555555555555';

const editPayload = {
  applicationType: 'MULTIPURPOSE',
  requestedAmount: 10000000,
  tenor: 3,
  monthlyIncome: 8000000,
  notes: 'Catatan hasil edit',
};

beforeEach(resetDatabase);
afterAll(() => pool.end());

async function createPending(overrides) {
  const response = await request(app)
    .post('/api/applications')
    .send(validPayload(overrides));
  return response.body;
}

async function decide(id, status) {
  return request(app).patch(`/api/applications/${id}/status`).send({ status });
}

describe('PATCH /api/applications/:id', () => {
  it('edits a pending application and recomputes the monthly payment', async () => {
    const application = await createPending();

    const response = await request(app)
      .patch(`/api/applications/${application.id}`)
      .send(editPayload);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      applicationType: 'MULTIPURPOSE',
      requestedAmount: 10000000,
      tenor: 3,
      monthlyPayment: 3333334,
      status: 'PENDING',
    });
  });

  it('leaves the customer untouched even when the payload carries one', async () => {
    const application = await createPending();

    const response = await request(app)
      .patch(`/api/applications/${application.id}`)
      .send({
        ...editPayload,
        name: 'Nama Baru',
        identityNumber: '9999999999999999',
      });

    expect(response.body).toMatchObject({
      customerId: application.customerId,
      customerName: 'Siti Aminah',
      identityNumber: '3201014405900001',
    });
  });

  it('rejects an edit whose tenor is not a valid number of months', async () => {
    const application = await createPending();

    const response = await request(app)
      .patch(`/api/applications/${application.id}`)
      .send({ ...editPayload, tenor: 0 });

    expect(response.status).toBe(422);
    expect(response.body.error.fields).toEqual({
      tenor: 'Tenor minimal 1 bulan',
    });
  });

  it('rejects an edit that exceeds the tenor limit', async () => {
    const application = await createPending();

    const response = await request(app)
      .patch(`/api/applications/${application.id}`)
      .send({ ...editPayload, tenor: 25 });

    expect(response.status).toBe(422);
    expect(response.body.error.message).toBe('Tenor maksimal 24 bulan');
  });

  it('refuses to edit an application that was already decided', async () => {
    const application = await createPending();
    await decide(application.id, 'APPROVED');

    const response = await request(app)
      .patch(`/api/applications/${application.id}`)
      .send(editPayload);

    expect(response.status).toBe(409);
    expect(response.body.error.message).toBe(
      'Pengajuan yang sudah diputuskan tidak dapat diubah',
    );
  });

  it('answers 404 for an unknown or malformed id', async () => {
    const unknown = await request(app)
      .patch(`/api/applications/${UNKNOWN_ID}`)
      .send(editPayload);
    const malformed = await request(app)
      .patch('/api/applications/bukan-uuid')
      .send(editPayload);

    expect(unknown.status).toBe(404);
    expect(malformed.status).toBe(404);
    expect(malformed.body.error.message).toBe('Pengajuan tidak ditemukan');
  });
});

describe('PATCH /api/applications/:id/status', () => {
  it('approves a pending application', async () => {
    const application = await createPending();

    const response = await decide(application.id, 'APPROVED');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('APPROVED');
  });

  it('rejects a pending application and frees its quota slot', async () => {
    const application = await createPending();

    const response = await decide(application.id, 'REJECTED');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('REJECTED');

    const customer = await request(app).get('/api/customers/3201014405900001');
    expect(customer.body.quota).toEqual({ used: 0, limit: 3, remaining: 3 });
    expect(customer.body.rejectedCount).toBe(1);
  });

  it('refuses a second decision on the same application', async () => {
    const application = await createPending();
    await decide(application.id, 'APPROVED');

    const response = await decide(application.id, 'REJECTED');

    expect(response.status).toBe(409);
    expect(response.body.error.message).toBe(
      'Pengajuan yang sudah diputuskan tidak dapat diubah',
    );
  });

  it('accepts only APPROVED or REJECTED as the new status', async () => {
    const application = await createPending();

    const response = await decide(application.id, 'PENDING');

    expect(response.status).toBe(422);
    expect(response.body.error.fields).toEqual({
      status: 'Status tidak valid',
    });
  });

  it('answers 404 for an unknown id', async () => {
    const response = await decide(UNKNOWN_ID, 'APPROVED');

    expect(response.status).toBe(404);
  });
});
