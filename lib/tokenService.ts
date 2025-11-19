import { ENV } from '@/config/env';
import axios from 'axios';

// Cliente axios básico independiente (sin interceptores)
const baseApi = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: ENV.API_TIMEOUT,
});

/**
 * Decodifica un JWT para obtener su payload
 * @param token - Token JWT a decodificar
 * @returns El payload del token o null si falla
 */
export const decodeJWT = (token: string): { exp: number } | null => {
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
        console.error('[TokenService] Error decoding JWT:', error);
        return null;
    }
};

/**
 * Verifica si el token está próximo a expirar
 * @param token - Token JWT a verificar
 * @returns true si expira pronto o ya expiró
 */
export const isTokenExpiringSoon = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    
    return (expirationTime - now) <= ENV.TOKEN_EXPIRY_THRESHOLD;
};

/**
 * Verifica si el token ya expiró
 * @param token - Token JWT a verificar
 * @returns true si el token está expirado
 */
export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
};

/**
 * Refresca el access token usando el refresh token
 * @param refreshToken - Refresh token a usar
 * @returns El nuevo access token o null si falla
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ access: string; refresh?: string } | null> => {
    if (!refreshToken) {
        console.warn('[TokenService] No refresh token provided');
        return null;
    }
    
    try {
        const response = await baseApi.post('/token/refresh/', {
            refresh: refreshToken
        });
        
        const { access, refresh } = response.data;
        
        return {
            access,
            refresh: refresh || refreshToken // Usar el nuevo si viene, sino mantener el actual
        };
    } catch (error) {
        console.error('[TokenService] Error refreshing token:', error);
        return null;
    }
};

