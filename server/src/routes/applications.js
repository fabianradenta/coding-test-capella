import { Router } from 'express';
import { createApplication } from '../controllers/applicationController.js';

export const applicationsRouter = Router();

applicationsRouter.post('/', createApplication);
