import api from './axios';

// --- LOGIN ---
export const apiLogin = async (username: string, password: string) => {
    const response = await api.post('/token/', {
        username: username,
        password: password,
    });
    return { token: response.data.access, refresh: response.data.refresh };
};

// --- REGISTRO ---
export const apiRegister = async (username: string, email: string, password: string) => {
    const response = await api.post('/register/', {
        username: username,
        email: email,
        password: password,
    });

    const { access, refresh, ...user } = response.data;
    return { token: access, refresh, user };
};