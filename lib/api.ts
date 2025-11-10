import { User } from '@/types/types';
import api from './axios';

// --- LOGIN ---
export const apiLogin = async (
    email: string, 
    password: string
): Promise<{ token: string, refresh: string, user: User}> => {
    const response = await api.post('/token/', {
        email: email,
        password: password,
    });

    const { access, refresh, ...user } = response.data as { access: string, refresh: string } & User;
    return { token: access, refresh, user };
};

// --- REGISTRO ---
export const apiRegister = async (
    username: string, 
    email: string, 
    password: string
): Promise<{ token: string, refresh: string, user: User }> => {
    const response = await api.post('/register/', {
        username: username,
        email: email,
        password: password,
    });

    const { access, refresh, ...user } = response.data as { access: string, refresh: string } & User;
    return { token: access, refresh, user };
};