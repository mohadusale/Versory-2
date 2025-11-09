import { apiLogin, apiRegister } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from 'react-native';


export const useAuth = () => {
    const { setToken, setUser, logout: storeLogout } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            // 1. Llama a la API
            const { token } = await apiLogin(username, password);

            // 2. Guarda el token 'access'
            setToken(token);

            // 3. Actualmente la API no devuelve datos del usuario
            // Tendríamos que hacer otra llamada para pedirlos
            // Por ahora simplemente guardo el username
            setUser({ username: username, email: '', name: '' });

            Alert.alert('Éxito', `¡Bienvenido de nuevo, ${username}!`);
            router.replace('/library');
        } catch (error: any) {
            let errorMessage = 'Algo salió mal al iniciar sesión.';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            Alert.alert('Error de Login', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, username: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const { token, user } = await apiRegister(name, username, email, password);

            setToken(token);
            setUser(user);

            Alert.alert('Éxito', `¡Bienvenido a Versory, ${user.username}!`);
            router.replace('/library');
        } catch (error: any) {
            let errorMessage = 'Algo salió mal al registrarte.';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            Alert.alert('Error de Registro', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        storeLogout();
        router.replace('/login');
    };

    return {
        login,
        register,
        logout,
        isLoading
    };
};