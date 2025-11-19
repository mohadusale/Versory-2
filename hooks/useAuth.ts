import { apiLogin, apiRegister } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { ErrorCode, handleError, showError } from "@/utils/errorHandler";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from 'react-native';

export const useAuth = () => {
    const { setTokens, setUser, logout: storeLogout } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // 1. Llama a la API
            const { token, refresh, user } = await apiLogin(email, password);

            // 2. Guarda en el store de Zustand
            setTokens(token, refresh);
            setUser(user);

            Alert.alert('Éxito', `¡Bienvenido de nuevo, ${user.username}!`);
            router.replace('/(tabs)');
        } catch (error: unknown) {
            const appError = handleError(error);
            
            // Personalizar mensaje para credenciales inválidas
            if (appError.code === ErrorCode.UNAUTHORIZED) {
                showError(
                    { ...appError, message: 'Email o contraseña incorrectos' },
                    { title: 'Error de Login' }
                );
            } else {
                showError(error, { title: 'Error de Login' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const { token, refresh, user } = await apiRegister(username, email, password);

            setTokens(token, refresh);
            setUser(user);

            Alert.alert('Éxito', `¡Bienvenido a Versory, ${user.username}!`);
            router.replace('/(tabs)');
        } catch (error: unknown) {
            showError(error, { title: 'Error de Registro' });
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