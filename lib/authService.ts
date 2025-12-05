import { useAuthStore } from '@/store/authStore';
import { refreshAccessToken as refreshToken } from './tokenService';

/**
 * Función wrapper para refrescar el token y actualizar el store
 * @returns true si el refresh fue exitoso, false si falló
 */
export const refreshAccessToken = async (): Promise<boolean> => {
    const { refreshToken: currentRefreshToken, setTokens, logout } = useAuthStore.getState();
    
    if (!currentRefreshToken) {
        logout();
        return false;
    }
    
    try {
        const tokens = await refreshToken(currentRefreshToken);
        
        if (!tokens) {
            logout();
            return false;
        }
        
        setTokens(tokens.access, tokens.refresh || currentRefreshToken);
        return true;
    } catch (error) {
        logout();
        return false;
    }
};
