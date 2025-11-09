import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const API_URL = 'http://192.168.1.162:8000';

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

export default api;