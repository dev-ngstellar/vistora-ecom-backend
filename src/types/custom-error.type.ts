import { ApiErrorDetail } from './api-response.type';

export interface ICustomError {
  statusCode: number;
  message: string;
  errors?: ApiErrorDetail[];
  isOperational?: boolean;
}
