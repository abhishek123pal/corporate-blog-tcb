// ─────────────────────────────────────────
// GENERIC API RESPONSE WRAPPER
// ─────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true;
  data:    T;
};

export type ApiError = {
  success: false;
  error:   string;
  code?:   "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "SERVER_ERROR";
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────

export type PaginationParams = {
  page:     number;
  pageSize: number;
};

export type PaginatedResponse<T> = {
  items:       T[];
  total:       number;
  page:        number;
  pageSize:    number;
  hasNextPage: boolean;
};

// ─────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────

export type RateLimitResult = {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;
};