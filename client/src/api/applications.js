import { request } from './client.js';

export function listApplications(filters = {}, options) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return request(`/applications${query ? `?${query}` : ''}`, options);
}

export function getApplication(id, options) {
  return request(`/applications/${id}`, options);
}

export function createApplication(body) {
  return request('/applications', { method: 'POST', body });
}

export function updateApplication(id, body) {
  return request(`/applications/${id}`, { method: 'PATCH', body });
}

export function decideApplication(id, status) {
  return request(`/applications/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}
