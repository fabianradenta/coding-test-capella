import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';
import { resetDatabase, setStatus, validPayload } from './helpers.js';

const app = createApp();

beforeEach(resetDatabase);
afterAll(() => pool.end());

async function createApplication(overrides) {
  return request(app).post('/api/applications').send(validPayload(overrides));
}

describe('POST /api/applications', () => {
  it('creates a pending application and the customer behind it', async () => {
    const response = await createApplication();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: 'PENDING',
      customerName: 'Siti Aminah',
      identityNumber: '3201014405900001',
      requestedAmount: 120000000,
      monthlyPayment: 5000000,
    });

    const { rows } = await pool.query('SELECT name FROM customers');
    expect(rows).toEqual([{ name: 'Siti Aminah' }]);
  });

  it('accepts the boundary values of every limit', async () => {
    const response = await createApplication({
      monthlyIncome: 1000000,
      requestedAmount: 200000000,
      tenor: 24,
    });

    expect(response.status).toBe(201);
  });

  it('rounds the monthly payment up', async () => {
    const response = await createApplication({
      requestedAmount: 10000000,
      tenor: 3,
    });

    expect(response.body.monthlyPayment).toBe(3333334);
  });

  it('rejects an income below one million with the required message', async () => {
    const response = await createApplication({ monthlyIncome: 999999 });

    expect(response.status).toBe(422);
    expect(response.body.error.message).toBe(
      'Nasabah belum dapat mengajukan pinjaman',
    );
  });

  it('rejects an amount above two hundred million', async () => {
    const response = await createApplication({ requestedAmount: 200000001 });

    expect(response.status).toBe(422);
    expect(response.body.error.message).toBe(
      'Nominal pengajuan maksimal Rp200.000.000',
    );
  });

  it('rejects a tenor above twenty four months', async () => {
    const response = await createApplication({ tenor: 25 });

    expect(response.status).toBe(422);
    expect(response.body.error.message).toBe('Tenor maksimal 24 bulan');
  });

  it('reports every empty field at once', async () => {
    const response = await request(app).post('/api/applications').send({});

    expect(response.status).toBe(422);
    expect(response.body.error.fields).toEqual({
      identityNumber: 'Nomor identitas wajib diisi',
      name: 'Nama lengkap wajib diisi',
      applicationType: 'Tipe pengajuan tidak valid',
      requestedAmount: 'Nominal pengajuan harus lebih dari 0',
      tenor: 'Tenor minimal 1 bulan',
      monthlyIncome: 'Pendapatan bulanan wajib diisi',
      notes: 'Catatan wajib diisi',
    });
  });

  it('rejects an amount of zero and a tenor of zero', async () => {
    const response = await createApplication({
      requestedAmount: 0,
      tenor: 0,
      notes: '   ',
    });

    expect(response.status).toBe(422);
    expect(response.body.error.fields).toEqual({
      requestedAmount: 'Nominal pengajuan harus lebih dari 0',
      tenor: 'Tenor minimal 1 bulan',
      notes: 'Catatan wajib diisi',
    });
  });

  it('stops a customer at three pending or approved applications', async () => {
    const first = await createApplication();
    await setStatus(first.body.id, 'APPROVED');
    await createApplication();
    await createApplication();

    const fourth = await createApplication();

    expect(fourth.status).toBe(422);
    expect(fourth.body.error.message).toBe(
      'Nasabah telah mencapai batas maksimal 3 pengajuan',
    );
  });

  it('does not count rejected applications against the quota', async () => {
    for (let i = 0; i < 3; i += 1) {
      const created = await createApplication();
      await setStatus(created.body.id, 'REJECTED');
    }

    const response = await createApplication();

    expect(response.status).toBe(201);
  });

  it('refuses a known identity number used with another name', async () => {
    await createApplication();

    const response = await createApplication({ name: 'Orang Lain' });

    expect(response.status).toBe(422);
    expect(response.body.error.message).toBe(
      'Nomor identitas sudah terdaftar atas nama lain',
    );
  });

  it('treats the same name written differently as the same customer', async () => {
    const first = await createApplication();

    const second = await createApplication({ name: '  siti   AMINAH ' });

    expect(second.status).toBe(201);
    expect(second.body.customerId).toBe(first.body.customerId);
    expect(second.body.customerName).toBe('Siti Aminah');
  });
});
