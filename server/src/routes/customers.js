import { Router } from 'express';
import { getCustomer } from '../controllers/customerController.js';

export const customersRouter = Router();

customersRouter.get('/:identityNumber', getCustomer);
