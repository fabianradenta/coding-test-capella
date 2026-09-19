import { Router } from 'express';
import {
  createApplication,
  listApplications,
} from '../controllers/applicationController.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', listApplications);
applicationsRouter.post('/', createApplication);
