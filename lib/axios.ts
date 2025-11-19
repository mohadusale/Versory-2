import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from './authService';

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: ENV.API_TIMEOUT,
});

/**
 * Interceptor de request: añade el token de autorización a cada petición
 */
api.interceptors.request.use(
    (config) => {
        // Obtenemos el token del store de Zustand
        const token = useAuthStore.getState().token;

        if (token) {
            // Si el token existe, lo añadimos a la cabecera
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

/**
 * Interceptor de respuesta: maneja errores 401 y refresca el token si es necesario
 */
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // Si es error 401 (no autorizado) y no hemos intentado refresh aún
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            
            console.log('[API] Token expired, attempting refresh...');
            
            // Intentar refrescar el token
            const refreshSuccess = await refreshAccessToken();
            
            if (refreshSuccess) {
                // Reintentar la petición original con el nuevo token
                const newToken = useAuthStore.getState().token;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                console.log('[API] Token refreshed successfully, retrying request');
                return api(originalRequest);
            } else {
                console.warn('[API] Token refresh failed, user will be logged out');
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;