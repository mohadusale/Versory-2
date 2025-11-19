/**
 * Tipos relacionados con las respuestas de la API
 */

import { User, UserBook } from './types';

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Respuesta de error de la API
 */
export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * Respuesta de autenticación (login/register)
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Request de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Request de registro
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Request de refresh token
 */
export interface RefreshTokenRequest {
  refresh: string;
}

/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

/**
 * Request para buscar libros
 */
export interface SearchBooksRequest {
  query: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta de búsqueda de libros
 */
export interface SearchBooksResponse {
  results: UserBook[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

/**
 * Request para añadir un libro a la biblioteca
 */
export interface AddBookRequest {
  isbn: string;
  status: 'TR' | 'RD' | 'FN';
}

/**
 * Request para actualizar el estado de un libro
 */
export interface UpdateBookStatusRequest {
  status: 'TR' | 'RD' | 'FN';
  pages_read?: number;
  rating?: number;
  start_date?: string;
  finished_date?: string;
}

