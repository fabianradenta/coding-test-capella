import * as applicationService from '../services/applicationService.js';
import {
  parseApplicationFilters,
  parseCreateApplication,
} from '../validators/applicationValidator.js';

export async function createApplication(req, res) {
  const input = parseCreateApplication(req.body);
  const application = await applicationService.createApplication(input);
  res.status(201).json(application);
}

export async function listApplications(req, res) {
  const filters = parseApplicationFilters(req.query);
  const result = await applicationService.listApplications(filters);
  res.json(result);
}

export async function getApplication(req, res) {
  const detail = await applicationService.getApplicationDetail(req.params.id);
  res.json(detail);
}
