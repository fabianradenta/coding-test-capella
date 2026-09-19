import { withTransaction } from '../db/pool.js';
import { BusinessRuleError } from '../errors.js';
import * as applicationRepository from '../repositories/applicationRepository.js';
import * as customerRepository from '../repositories/customerRepository.js';

export const QUOTA_LIMIT = 3;

const MIN_MONTHLY_INCOME = 1_000_000;
const MAX_REQUESTED_AMOUNT = 200_000_000;
const MAX_TENOR = 24;

function assertFinancingLimits({ monthlyIncome, requestedAmount, tenor }) {
  if (monthlyIncome < MIN_MONTHLY_INCOME) {
    throw new BusinessRuleError('Nasabah belum dapat mengajukan pinjaman');
  }
  if (requestedAmount > MAX_REQUESTED_AMOUNT) {
    throw new BusinessRuleError('Nominal pengajuan maksimal Rp200.000.000');
  }
  if (tenor > MAX_TENOR) {
    throw new BusinessRuleError('Tenor maksimal 24 bulan');
  }
}

function normalizeName(value) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function assertSameCustomerName(customer, name) {
  if (normalizeName(customer.name) !== normalizeName(name)) {
    throw new BusinessRuleError(
      'Nomor identitas sudah terdaftar atas nama lain',
    );
  }
}

// Locks the customer row so that two concurrent submissions cannot both pass the quota check.
// A freshly inserted row is already locked by this transaction.
async function lockOrCreateCustomer(client, { identityNumber, name }) {
  const existing = await customerRepository.findByIdentityNumberForUpdate(
    identityNumber,
    client,
  );
  if (existing) {
    assertSameCustomerName(existing, name);
    return existing;
  }

  const created = await customerRepository.insertIfAbsent(
    { name, identityNumber },
    client,
  );
  if (created) {
    return created;
  }

  const concurrent = await customerRepository.findByIdentityNumberForUpdate(
    identityNumber,
    client,
  );
  assertSameCustomerName(concurrent, name);
  return concurrent;
}

export async function createApplication(input) {
  assertFinancingLimits(input);

  return withTransaction(async (client) => {
    const customer = await lockOrCreateCustomer(client, input);

    const activeCount = await applicationRepository.countActiveByCustomerId(
      customer.id,
      client,
    );
    if (activeCount >= QUOTA_LIMIT) {
      throw new BusinessRuleError(
        'Nasabah telah mencapai batas maksimal 3 pengajuan',
      );
    }

    const application = await applicationRepository.insert(
      {
        customerId: customer.id,
        applicationType: input.applicationType,
        requestedAmount: input.requestedAmount,
        tenor: input.tenor,
        monthlyIncome: input.monthlyIncome,
        notes: input.notes,
        monthlyPayment: Math.ceil(input.requestedAmount / input.tenor),
      },
      client,
    );

    return {
      ...application,
      customerName: customer.name,
      identityNumber: customer.identityNumber,
    };
  });
}

export async function listApplications(filters) {
  const [items, counts] = await Promise.all([
    applicationRepository.findAll(filters),
    applicationRepository.countByStatus(filters),
  ]);

  return { items, counts };
}
