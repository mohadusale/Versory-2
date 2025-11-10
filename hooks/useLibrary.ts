import api from '@/lib/axios';
import { UserBook } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';

// Función para obtener la biblioteca desde la API
const fetchLibrary = async (): Promise<UserBook[]> => {
    // Llamamos al endpoint GET /api/status/
    // Gracias al interceptor de Axios, el token de auth ya va incluido
    const response = await api.get<UserBook[]>('/status/');
    return response.data;
};

export const useLibrary = () => {
    // Usar React Query para manejar la petición
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['library'],
        queryFn: fetchLibrary,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    // Los datos pueden ser undefined al inicio, usar array vacío como fallback
    const books = data ?? [];

    // Lógica de filtrado (mantenemos useMemo para optimización)
    const readingBooks = useMemo(
        () => books.filter(b => b.status === 'RD'),
        [books]
    );

    const toReadBooks = useMemo(
        () => books.filter(b => b.status === 'TR'),
        [books]
    );

    const finishedBooks = useMemo(
        () => books.filter(b => b.status === 'FN'),
        [books]
    );

    // Retornar el mismo "contrato" que antes
    return {
        readingBooks,
        toReadBooks,
        finishedBooks,
        isLoading,
        error: error as Error | null,
        refresh: refetch,
        totalBooks: books.length
    };
};