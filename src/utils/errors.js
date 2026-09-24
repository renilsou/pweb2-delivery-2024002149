/**
 * Erros de aplicação, cada um já carregando o status HTTP correspondente.
 * O controller apenas repassa (via next); o server.js tem o middleware
 * central que converte AppError em `{ "erro": mensagem }` + status.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

/** 400 — entrada inválida. */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/** 404 — recurso não encontrado. */
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

/** 409 — conflito de unicidade (ex.: entrega ativa duplicada). */
export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

/** 422 — violação de regra de estado/negócio (ex.: transição inválida). */
export class BusinessRuleError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}
