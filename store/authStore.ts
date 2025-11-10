import { User } from '@/types/types';
import * as SecureStore from 'expo-secure-store';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;

    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void; 
    logout: () => void;
}

// Helper para user SecureStore
const useSecureStore: any = {
    getItem: async (name: string): Promise<string | null> => {
        return SecureStore.getItemAsync(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await SecureStore.deleteItemAsync(name);
    }
}

// Creamos el store
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,

            // Acción para guardar ambos tokens
            setTokens: (accessToken: string, refreshToken: string) => {
                set({ token: accessToken, refreshToken, isAuthenticated: true });
            },

            // Acción para guardar el usuario
            setUser: (user: User) => {
                set({ user });
            },

            // Acción de logout
            logout: () => {
                set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => useSecureStore)
        }
    )
)