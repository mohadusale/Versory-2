/**
 * Tipos de datos principales de la aplicación
 */

/**
 * Usuario de la aplicación
 */
export interface User {
    id: number;
    username: string;
    email: string;
    date_joined?: string;
}

/**
 * Autor de un libro
 */
export interface Author {
    id: number;
    name: string;
}

/**
 * Género literario
 */
export interface Genre {
    id: number;
    name: string;
}

/**
 * Estados posibles de un libro en la biblioteca
 */
export type BookStatus = 'TR' | 'RD' | 'FN';

/**
 * Mapeo de códigos de estado a nombres legibles
 */
export const BOOK_STATUS_DISPLAY: Record<BookStatus, string> = {
    'TR': 'Por Leer',
    'RD': 'Leyendo',
    'FN': 'Finalizado',
};

/**
 * Fuentes de datos de libros
 */
export type BookSource = 'GOOGLE_BOOKS' | 'OPEN_LIBRARY' | 'MANUAL' | 'UNKNOWN';

/**
 * Información básica de un libro
 */
export interface Book {
    isbn: string;
    title: string;
    pages_count: number;
    description: string | null;
    cover_url: string | null;
    published_date: string | null;
    authors: Author[];
    genres: Genre[];
    source: BookSource | string;
    publisher?: string | null;
    language?: string | null;
}

/**
 * Relación entre un usuario y un libro en su biblioteca
 */
export interface UserBook {
    id: number;
    book: Book;
    status: BookStatus;
    status_display: string;
    start_date: string | null;
    pages_read: number | null;
    finished_date: string | null;
    rating: number | null;
    created_at?: string;
    updated_at?: string;
}

/**
 * Filtros para la biblioteca
 */
export interface LibraryFilters {
    genres: string[];
    authors: string[];
    year: number | null;
    rating?: number | null;
}

/**
 * Opciones de ordenación
 */
export type SortOption = 
    | 'title_asc'
    | 'title_desc'
    | 'author_asc'
    | 'author_desc'
    | 'date_added_asc'
    | 'date_added_desc'
    | 'rating_asc'
    | 'rating_desc'
    | 'pages_asc'
    | 'pages_desc';

/**
 * Mapeo de opciones de ordenación a nombres legibles
 */
export const SORT_OPTIONS_DISPLAY: Record<SortOption, string> = {
    'title_asc': 'Título (A-Z)',
    'title_desc': 'Título (Z-A)',
    'author_asc': 'Autor (A-Z)',
    'author_desc': 'Autor (Z-A)',
    'date_added_asc': 'Fecha añadido (Antiguo primero)',
    'date_added_desc': 'Fecha añadido (Nuevo primero)',
    'rating_asc': 'Valoración (Menor primero)',
    'rating_desc': 'Valoración (Mayor primero)',
    'pages_asc': 'Páginas (Menor primero)',
    'pages_desc': 'Páginas (Mayor primero)',
};

/**
 * Estados de carga asíncronos
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Estado asíncrono genérico
 */
export interface AsyncState<T> {
    status: AsyncStatus;
    data: T | null;
    error: Error | null;
}

/**
 * Paginación
 */
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}