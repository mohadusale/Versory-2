import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const API_URL = 'http://192.168.1.162:8000/api';

// Cliente axios básico sin interceptores
const baseApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Función para refrescar token (sin usar el cliente principal)
export const refreshAccessToken = async (): Promise<boolean> => {
    const { refreshToken, setTokens, logout } = useAuthStore.getState();
    
    if (!refreshToken) {
        logout();
        return false;
    }
    
    try {
        const response = await baseApi.post('/token/refresh/', {
            refresh: refreshToken
        });
        
        const { access, refresh } = response.data;
        setTokens(access, refresh || refreshToken);
        
        return true;
    } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
        return false;
    }
};
