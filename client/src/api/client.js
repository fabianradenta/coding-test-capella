export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // An aborted request is the caller replacing it, not a failure to show.
    if (err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError('Tidak dapat terhubung ke server.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message ?? 'Terjadi kesalahan pada server',
      {
        status: response.status,
        fields: data?.error?.fields,
      },
    );
  }

  return data;
}
