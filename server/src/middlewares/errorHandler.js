import { AppError, NotFoundError, ValidationError } from '../errors.js';

export function notFoundHandler(req, res, next) {
  next(new NotFoundError('Endpoint tidak ditemukan'));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  // express.json() rejects an unparsable body before any route runs.
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(422).json({ error: { message: 'Format JSON tidak valid' } });
    return;
  }

  if (err instanceof AppError) {
    const body = { message: err.message };
    if (err instanceof ValidationError) {
      body.fields = err.fields;
    }
    res.status(err.status).json({ error: body });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Terjadi kesalahan pada server' } });
}
