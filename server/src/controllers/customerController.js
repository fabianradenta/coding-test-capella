import * as customerService from '../services/customerService.js';

export async function getCustomer(req, res) {
  const customer = await customerService.getCustomerByIdentityNumber(
    req.params.identityNumber,
  );
  res.json(customer);
}
