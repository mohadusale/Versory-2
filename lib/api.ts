import { AuthResponse } from '@/types/api';
import { Book, BookStatus, UserBook } from '@/types/types';
import api from './axios';

// --- TIPOS AUXILIARES ---
interface UpdateStatusData {
    status?: BookStatus;
    pages_read?: number;
    rating?: number;
    finished_date?: string;
    start_date?: string;
}

// --- AUTH ---

export const apiLogin = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/token/', { email, password });
    return { 
        token: response.data.access, 
        refresh: response.data.refresh, 
        user: { 
            id: response.data.user_id || 0, // Fallback si no viene
            username: response.data.username, 
            email: response.data.email 
        } 
    };
};

export const apiRegister = async (username: string, email: string, password: string) => {
    const response = await api.post<AuthResponse>('/register/', { username, email, password });
    return { 
        token: response.data.access, 
        refresh: response.data.refresh, 
        user: {
            id: response.data.user_id || 0,
            username: response.data.username,
            email: response.data.email
        }
    };
};


// --- BOOKS ---

/**
 * Busca un libro por ISBN
 */
export const apiSearchBook = async (isbn: string): Promise<Book> => {
    const response = await api.post('/search-isbn', { isbn });
    return response.data;
};

// --- GESTIÓN DE ESTADO (Tu librería)

/**
 * Crea o Actualiza el estado de un libro en tu librería.
 */
export const apiAddOrUpdateBook = async (isbn: string, status: BookStatus, extraData?: Partial<UpdateStatusData>): Promise<UserBook> => {
    const response = await api.post<UserBook>('/status/', {
        book_isbn: isbn,
        status: status,
        ...extraData
    });
    return response.data;
};

/**
 * Actualiza un UserBookStatus existente por su ID (PATCH).
 * Se usa para actualizar páginas, rating, fechas, etc.
 */
export const apiPatchUserBook = async (statusId: number, data: UpdateStatusData): Promise<UserBook> => {
    const response = await api.patch<UserBook>(`/status/${statusId}/`, data);
    return response.data;
};

/**
 * Elimina un libro de la librería
 */
export const apiDeleteUserBook = async (statusId: number): Promise<void> => {
    await api.delete(`/status/${statusId}/`);
};

// --- RESEÑAS ---

export const apiCreateReview = async (statusId: number, review: string): Promise<any> => {
    const response = await api.post(`/status/${statusId}/review/`, { review });
    return response.data;
};