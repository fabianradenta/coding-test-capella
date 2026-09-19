import { Router } from 'express';
import {
  createApplication,
  decideApplication,
  getApplication,
  listApplications,
  updateApplication,
} from '../controllers/applicationController.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', listApplications);
applicationsRouter.get('/:id', getApplication);
applicationsRouter.post('/', createApplication);
applicationsRouter.patch('/:id', updateApplication);
applicationsRouter.patch('/:id/status', decideApplication);
