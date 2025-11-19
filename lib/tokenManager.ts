import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { refreshAccessToken } from './authService';
import { isTokenExpiringSoon } from './tokenService';

/**
 * Hook personalizado para manejar el refresh automático del token
 * Verifica periódicamente si el token está próximo a expirar y lo refresca si es necesario
 */
export const useTokenRefresh = () => {
    const { token } = useAuthStore();
    
    useEffect(() => {
        if (!token) {
            console.log('[TokenManager] No token available, skipping auto-refresh');
            return;
        }
        
        // Verificar periódicamente si el token necesita refresh
        const interval = setInterval(async () => {
            if (isTokenExpiringSoon(token)) {
                console.log('[TokenManager] Token expiring soon, refreshing...');
                await refreshAccessToken();
            }
        }, ENV.TOKEN_REFRESH_INTERVAL);
        
        console.log('[TokenManager] Auto-refresh enabled');
        
        return () => {
            console.log('[TokenManager] Auto-refresh disabled');
            clearInterval(interval);
        };
    }, [token]);
};
