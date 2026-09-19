export class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.name = new.target.name;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(fields, message = 'Data yang dikirim tidak valid') {
    super(message, 422);
    this.fields = fields;
  }
}

export class BusinessRuleError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}
