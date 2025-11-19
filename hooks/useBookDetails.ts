/**
 * Hook para obtener los detalles de un libro por ID de UserBook
 */

import { ENV } from '@/config/env';
import api from '@/lib/axios';
import { UserBook } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';

/**
 * Obtiene los detalles de un libro desde la API
 * @param id - ID del UserBook (relación usuario-libro)
 * @returns Detalles completos del libro
 */
const fetchBookDetails = async (id: string): Promise<UserBook> => {
    const response = await api.get<UserBook>(`/status/${id}/`);
    return response.data;
};

/**
 * Hook para obtener y gestionar los detalles de un libro
 * @param id - ID del UserBook a obtener
 * @returns Estado del libro, funciones de refetch, etc.
 */
export const useBookDetails = (id: string) => {
    // Handler de errores
    const handleError = useErrorHandler({
        title: 'Error al cargar el libro',
        showAlert: false,
    });

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['book', id],
        queryFn: () => fetchBookDetails(id),
        staleTime: ENV.CACHE_STALE_TIME,
        retry: (failureCount, error) => {
            handleError(error);
            return failureCount < 2;
        },
        enabled: !!id, // Solo ejecutar si hay ID
    });

    return {
        book: data,
        isLoading,
        error: error as Error | null,
        refresh: refetch,
    };
};

