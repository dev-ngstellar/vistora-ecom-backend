export interface ApiResponseSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiResponseError {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
  stack?: string;
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;
