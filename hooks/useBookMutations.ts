import { apiAddOrUpdateBook, apiCreateReview, apiDeleteUserBook, apiPatchUserBook } from '@/lib/api';
import { BookStatus, UserBook } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';

export const useBookMutations = (bookId: string) => {
    const queryClient = useQueryClient();
    const handleError = useErrorHandler();

    // 1. Cambiar Estado (con fechas, rating y páginas opcional)
    const changeStatusMutation = useMutation({
        mutationFn: ({ status, start_date, finished_date, rating, pages_read }: { 
            status: BookStatus; 
            start_date?: string; 
            finished_date?: string; 
            rating?: number;
            pages_read?: number;
        }) => {
            const id = parseInt(bookId);
            return apiPatchUserBook(id, { status, start_date, finished_date, rating, pages_read });
        },
        onMutate: async (variables) => {
            // Optimistic update
            const queryKey = ['book', bookId];
            const previousBook = queryClient.getQueryData<UserBook>(queryKey);
            
            if (previousBook) {
                queryClient.setQueryData<UserBook>(queryKey, {
                    ...previousBook,
                    status: variables.status,
                    start_date: variables.start_date || previousBook.start_date,
                    finished_date: variables.finished_date || previousBook.finished_date,
                    rating: variables.rating !== undefined ? variables.rating : previousBook.rating,
                    pages_read: variables.pages_read !== undefined ? variables.pages_read : previousBook.pages_read,
                });
            }
            
            return { previousBook };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
        onError: (error, variables, context) => {
            if (context?.previousBook) {
                queryClient.setQueryData(['book', bookId], context.previousBook);
            }
            handleError(error);
        },
    });

    // 2. Actualizar Progreso (solo páginas)
    const updateProgressMutation = useMutation({
        mutationFn: ({ id, pages }: { id: number, pages: number }) => 
            apiPatchUserBook(id, { pages_read: pages }), 
        onMutate: async ({ pages }) => {
            const queryKey = ['book', bookId];
            const previousBook = queryClient.getQueryData<UserBook>(queryKey);
            
            if (previousBook) {
                queryClient.setQueryData<UserBook>(queryKey, {
                    ...previousBook,
                    pages_read: pages,
                });
            }
            
            return { previousBook };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
        onError: (error, variables, context) => {
            if (context?.previousBook) {
                queryClient.setQueryData(['book', bookId], context.previousBook);
            }
            handleError(error);
        },
    });

    // 3. Actualizar Rating (solo valoración)
    const updateRatingMutation = useMutation({
        mutationFn: ({ id, rating }: { id: number, rating: number }) => 
            apiPatchUserBook(id, { rating }),
        onMutate: async ({ rating }) => {
            const queryKey = ['book', bookId];
            const previousBook = queryClient.getQueryData<UserBook>(queryKey);
            
            if (previousBook) {
                queryClient.setQueryData<UserBook>(queryKey, {
                    ...previousBook,
                    rating,
                });
            }
            
            return { previousBook };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
        onError: (error, variables, context) => {
            if (context?.previousBook) {
                queryClient.setQueryData(['book', bookId], context.previousBook);
            }
            handleError(error);
        },
    });

    // 4. Actualizar Fechas
    const updateDatesMutation = useMutation({
        mutationFn: ({ id, start_date, finished_date }: { 
            id: number; 
            start_date?: string; 
            finished_date?: string;
        }) => apiPatchUserBook(id, { start_date, finished_date }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
        onError: handleError,
    });

    // 5. Eliminar
    const deleteBookMutation = useMutation({
        mutationFn: (id: number) => apiDeleteUserBook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
        },
        onError: handleError,
    });
    
    // 6. Crear Reseña
    const addReviewMutation = useMutation({
        mutationFn: ({ id, review }: { id: number, review: string }) =>
            apiCreateReview(id, review),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
        onError: handleError
    });

    return {
        changeStatus: changeStatusMutation.mutateAsync,
        updateProgress: updateProgressMutation.mutateAsync,
        updateRating: updateRatingMutation.mutateAsync,
        updateDates: updateDatesMutation.mutateAsync,
        deleteBook: deleteBookMutation.mutateAsync,
        addReview: addReviewMutation.mutateAsync,
        
        isUpdating: 
            changeStatusMutation.isPending || 
            updateProgressMutation.isPending || 
            updateRatingMutation.isPending ||
            updateDatesMutation.isPending ||
            deleteBookMutation.isPending
    };
};