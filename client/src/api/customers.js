import { request } from './client.js';

export function getCustomer(identityNumber, options) {
  return request(`/customers/${identityNumber}`, options);
}
