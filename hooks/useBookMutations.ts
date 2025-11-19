import { apiAddOrUpdateBook, apiCreateReview, apiDeleteUserBook, apiPatchUserBook } from '@/lib/api';
import { BookStatus, UserBook } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';

export const useBookMutations = (bookId: string) => {
    const queryClient = useQueryClient();
    const handleError = useErrorHandler();

    // 1. Añadir o Mover libro (Usando ISBN)
    const addOrUpdateBookMutation = useMutation({
        // Ahora acepta un objeto 'data' opcional
        mutationFn: ({ isbn, status, data }: { isbn: string, status: BookStatus, data?: any }) => 
            apiAddOrUpdateBook(isbn, status, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['book'] }); 
        },
        onError: handleError,
    });

    // 2. Actualizar Progreso (Usando ID de Status)
    const updateProgressMutation = useMutation({
        mutationFn: ({ id, pages }: { id: number, pages: number }) => 
            apiPatchUserBook(id, { pages_read: pages, status: 'RD' }), 
        onMutate: async ({ pages }) => {
            // Actualizar el estado localmente sin esperar al servidor
            const queryKey = ['book', bookId];
            const previousBook = queryClient.getQueryData<UserBook>(queryKey);
            
            if (previousBook) {
                queryClient.setQueryData<UserBook>(queryKey, {
                    ...previousBook,
                    pages_read: pages,
                    status: 'RD',
                });
            }
            
            return { previousBook };
        },
        onSuccess: () => {
            // Solo invalidar la librería, NO el libro actual
            queryClient.invalidateQueries({ queryKey: ['library'] });
        },
        onError: (error, variables, context) => {
            // Si falla, revertir
            if (context?.previousBook) {
                queryClient.setQueryData(['book', bookId], context.previousBook);
            }
            handleError(error);
        },
    });

    // 3. Puntuar y Terminar (Usando ID de Status)
    const rateBookMutation = useMutation({
        mutationFn: ({ id, rating }: { id: number, rating: number }) => 
            apiPatchUserBook(id, { rating, status: 'FN', finished_date: new Date().toISOString().split('T')[0] }), 
        onMutate: async ({ rating }) => {
            // Actualizar el estado localmente sin esperar al servidor
            const queryKey = ['book', bookId];
            const previousBook = queryClient.getQueryData<UserBook>(queryKey);
            
            if (previousBook) {
                queryClient.setQueryData<UserBook>(queryKey, {
                    ...previousBook,
                    rating,
                    status: 'FN',
                    finished_date: new Date().toISOString().split('T')[0],
                });
            }
            
            return { previousBook };
        },
        onSuccess: () => {
            // Solo invalidar la librería, NO el libro actual
            queryClient.invalidateQueries({ queryKey: ['library'] });
        },
        onError: (error, variables, context) => {
            // Si falla, revertir
            if (context?.previousBook) {
                queryClient.setQueryData(['book', bookId], context.previousBook);
            }
            handleError(error);
        },
    });

    // 4. Eliminar
    const deleteBookMutation = useMutation({
        mutationFn: (id: number) => apiDeleteUserBook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
        },
        onError: handleError,
    });
    
    // 5. Crear Reseña
    const addReviewMutation = useMutation({
        mutationFn: ({ id, review }: { id: number, review: string }) =>
            apiCreateReview(id, review),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
        },
        onError: handleError
    });

    return {
        addOrUpdateBook: addOrUpdateBookMutation.mutateAsync,
        updateProgress: updateProgressMutation.mutateAsync,
        rateBook: rateBookMutation.mutateAsync,
        deleteBook: deleteBookMutation.mutateAsync,
        addReview: addReviewMutation.mutateAsync,
        
        isUpdating: 
            addOrUpdateBookMutation.isPending || 
            updateProgressMutation.isPending || 
            rateBookMutation.isPending ||
            deleteBookMutation.isPending
    };
};