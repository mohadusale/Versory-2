import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { refreshAccessToken } from './authService';

// Decodificar JWT para obtener expiración
const decodeJWT = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

// Verificar si el token está próximo a expirar (5 minutos antes)
export const isTokenExpiringSoon = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const fiveMinutesInSeconds = 5 * 60;
    
    return (expirationTime - now) <= fiveMinutesInSeconds;
};

// Verificar si el token ya expiró
export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
};

// La función refreshAccessToken ahora está en authService.ts

// Hook para manejar refresh automático
export const useTokenRefresh = () => {
    const { token } = useAuthStore();
    
    useEffect(() => {
        if (!token) return;
        
        // Verificar cada 2 minutos si el token necesita refresh
        const interval = setInterval(async () => {
            if (isTokenExpiringSoon(token)) {
                await refreshAccessToken();
            }
        }, 2 * 60 * 1000); // 2 minutos
        
        return () => clearInterval(interval);
    }, [token]);
};
