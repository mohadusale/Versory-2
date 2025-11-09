import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { refreshAccessToken } from './authService';

const API_URL = 'http://192.168.1.162:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Obtenemos el token de nuestro store de Zustand
        const token = useAuthStore.getState().token;

        if (token) {
            // Si el token exitse, lo añadimos a la cabecera
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta para manejar tokens expirados
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Si es error 401 y no hemos intentado refresh aún
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Intentar refrescar el token
            const refreshSuccess = await refreshAccessToken();
            
            if (refreshSuccess) {
                // Reintentar la petición original con el nuevo token
                const newToken = useAuthStore.getState().token;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;