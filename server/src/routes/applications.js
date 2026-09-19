import { Router } from 'express';
import {
  createApplication,
  getApplication,
  listApplications,
} from '../controllers/applicationController.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', listApplications);
applicationsRouter.get('/:id', getApplication);
applicationsRouter.post('/', createApplication);
