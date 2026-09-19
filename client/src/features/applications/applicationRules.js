import { APPLICATION_TYPE_LABELS } from '../../utils/format.js';

export const MIN_MONTHLY_INCOME = 1_000_000;
export const MAX_REQUESTED_AMOUNT = 200_000_000;
export const MAX_TENOR = 24;

export function digitsOnly(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

export function toNumber(value) {
  return value === '' ? null : Number(value);
}

export function monthlyPaymentOf(requestedAmount, tenor) {
  if (!requestedAmount || !tenor) {
    return null;
  }
  return Math.ceil(requestedAmount / tenor);
}

// Mirrors the server validator so the form can answer without a round trip.
export function validateFields(values, { requireCustomer = true } = {}) {
  const errors = {};

  if (requireCustomer) {
    const identityNumber = values.identityNumber.trim();
    if (!identityNumber) {
      errors.identityNumber = 'Nomor identitas wajib diisi';
    } else if (!/^\d{16}$/.test(identityNumber)) {
      errors.identityNumber = 'Nomor identitas harus 16 digit angka';
    }

    const name = values.name.trim();
    if (!name) {
      errors.name = 'Nama lengkap wajib diisi';
    } else if (name.length > 100) {
      errors.name = 'Nama lengkap maksimal 100 karakter';
    }
  }

  if (!(values.applicationType in APPLICATION_TYPE_LABELS)) {
    errors.applicationType = 'Tipe pengajuan tidak valid';
  }

  const requestedAmount = toNumber(values.requestedAmount);
  if (!requestedAmount || requestedAmount <= 0) {
    errors.requestedAmount = 'Nominal pengajuan harus lebih dari 0';
  }

  const tenor = toNumber(values.tenor);
  if (!tenor || tenor < 1) {
    errors.tenor = 'Tenor minimal 1 bulan';
  }

  if (toNumber(values.monthlyIncome) === null) {
    errors.monthlyIncome = 'Pendapatan bulanan wajib diisi';
  }

  if (!values.notes.trim()) {
    errors.notes = 'Catatan wajib diisi';
  }

  return errors;
}

export function checkBusinessRules(values) {
  const monthlyIncome = toNumber(values.monthlyIncome);
  const requestedAmount = toNumber(values.requestedAmount);
  const tenor = toNumber(values.tenor);

  if (monthlyIncome !== null && monthlyIncome < MIN_MONTHLY_INCOME) {
    return {
      message: 'Nasabah belum dapat mengajukan pinjaman',
      detail: 'Pendapatan bulanan minimal Rp1.000.000.',
    };
  }
  if (requestedAmount !== null && requestedAmount > MAX_REQUESTED_AMOUNT) {
    return { message: 'Nominal pengajuan maksimal Rp200.000.000' };
  }
  if (tenor !== null && tenor > MAX_TENOR) {
    return { message: 'Tenor maksimal 24 bulan' };
  }

  return null;
}
