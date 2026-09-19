import { NotFoundError } from '../errors.js';
import * as applicationRepository from '../repositories/applicationRepository.js';
import * as customerRepository from '../repositories/customerRepository.js';
import { QUOTA_LIMIT } from './applicationService.js';

export async function getCustomerByIdentityNumber(identityNumber) {
  const customer =
    await customerRepository.findByIdentityNumber(identityNumber);
  if (!customer) {
    throw new NotFoundError('Nasabah tidak ditemukan');
  }

  const { active, rejected } =
    await applicationRepository.countStatusesByCustomerId(customer.id);

  return {
    id: customer.id,
    name: customer.name,
    identityNumber: customer.identityNumber,
    quota: {
      used: active,
      limit: QUOTA_LIMIT,
      remaining: Math.max(QUOTA_LIMIT - active, 0),
    },
    rejectedCount: rejected,
  };
}
