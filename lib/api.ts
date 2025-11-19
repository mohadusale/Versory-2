import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';
import { User } from '@/types/types';
import api from './axios';

/**
 * Inicia sesión con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Token de acceso, refresh token y datos del usuario
 */
export const apiLogin = async (
    email: string, 
    password: string
): Promise<{ token: string; refresh: string; user: User }> => {
    const requestData: LoginRequest = {
        email,
        password,
    };

    const response = await api.post<AuthResponse>('/token/', requestData);
    const { access, refresh, user } = response.data;
    
    return { 
        token: access, 
        refresh, 
        user 
    };
};

/**
 * Registra un nuevo usuario
 * @param username - Nombre de usuario
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Token de acceso, refresh token y datos del usuario
 */
export const apiRegister = async (
    username: string, 
    email: string, 
    password: string
): Promise<{ token: string; refresh: string; user: User }> => {
    const requestData: RegisterRequest = {
        username,
        email,
        password,
    };

    const response = await api.post<AuthResponse>('/register/', requestData);
    const { access, refresh, user } = response.data;
    
    return { 
        token: access, 
        refresh, 
        user 
    };
};