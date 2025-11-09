import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    user: { name: string, username: string, email: string } | null;
    isAuthenticated: boolean;

    setToken: (token: string) => void;
    setUser: (user: any) => void; //Por ahora "any", luego lo tiparé mejor
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
            user: null,
            isAuthenticated: false,

            // Acción para guardar el token
            setToken: (token: string) => {
                set({ token, isAuthenticated: true });
            },

            // Acción para guardar el usuario
            setUser: (user: any) => {
                set({ user });
            },

            // Acción de logout
            logout: () => {
                set({ token: null, user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => useSecureStore)
        }
    )
)