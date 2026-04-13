export type ApiSuccessResponse<T = unknown> = {
  success: true;
  message?: string;
  action?: string;
  data: T;
  pagination?: ApiPagination;
  meta?: Record<string, unknown>;
  /** Some index endpoints (e.g. invoices) attach aggregates next to paginated `data`. */
  summary?: unknown;
};

export type ApiErrorResponse = {
  success: false;
  message?: string;
  action?: string;
  data?: unknown;
};

export type ApiPagination = {
  total: number;
  limit: number;
  page: number;
  last_page: number;
  from: number;
  to: number;
};

export type BillingBackendValidationError = {
  message: string;
  errors: Record<string, string[]>;
};
