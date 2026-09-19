import * as applicationService from '../services/applicationService.js';
import { parseCreateApplication } from '../validators/applicationValidator.js';

export async function createApplication(req, res) {
  const input = parseCreateApplication(req.body);
  const application = await applicationService.createApplication(input);
  res.status(201).json(application);
}
