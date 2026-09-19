import * as applicationService from '../services/applicationService.js';
import {
  parseApplicationFilters,
  parseApplicationStatus,
  parseCreateApplication,
  parseUpdateApplication,
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

export async function updateApplication(req, res) {
  const input = parseUpdateApplication(req.body);
  const application = await applicationService.updateApplication(
    req.params.id,
    input,
  );
  res.json(application);
}

export async function decideApplication(req, res) {
  const { status } = parseApplicationStatus(req.body);
  const application = await applicationService.decideApplication(
    req.params.id,
    status,
  );
  res.json(application);
}
