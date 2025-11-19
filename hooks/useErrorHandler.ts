/**
 * Hook personalizado para manejo de errores en React Query
 */

import { AppError, handleError, isNetworkError, showError } from '@/utils/errorHandler';
import { useCallback } from 'react';

interface UseErrorHandlerOptions {
    /** Título del error a mostrar */
    title?: string;
    /** Callback personalizado para manejar el error */
    onError?: (error: AppError) => void;
    /** Si se debe mostrar un alert automáticamente */
    showAlert?: boolean;
}

/**
 * Hook para manejar errores de forma consistente
 * @param options - Opciones de configuración
 * @returns Función para manejar errores
 */
export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
    const {
        title = 'Error',
        onError,
        showAlert = true,
    } = options;

    const handleErrorCallback = useCallback((error: unknown) => {
        const appError = handleError(error);
        
        // Ejecutar callback personalizado si existe
        if (onError) {
            onError(appError);
        }
        
        // Mostrar alert si está habilitado
        if (showAlert) {
            // Personalizar mensaje para errores de red
            if (isNetworkError(error)) {
                showError(error, { 
                title: 'Error de Conexión',
                buttons: [{ text: 'Entendido' }]
            });
        } else {
            showError(error, { title });
        }
        }
    }, [title, onError, showAlert]);

    return handleErrorCallback;
};

