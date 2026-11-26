import React, { createContext, useState, useContext, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../services/api';
import type { ApiErrorResponse, AuthUser, LoginResponse } from '../types';

// El resultado distingue el inicio exitoso del rechazo que la pantalla debe mostrar.
type LoginResult =
    | { success: true }
    | { success: false; error: string };

// El contexto expone la sesión y las acciones disponibles para los componentes.
interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    login: (correo: string, contrasena: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
}

// El contexto inicia vacío para detectar si un componente no tiene proveedor.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// La validación descarta datos persistidos que no cumplan la estructura esperada del usuario.
function isAuthUser(value: unknown): value is AuthUser {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return (
        'id_usuario' in value &&
        typeof value.id_usuario === 'number' &&
        'nombre_completo' in value &&
        typeof value.nombre_completo === 'string' &&
        'correo' in value &&
        typeof value.correo === 'string' &&
        'rol' in value &&
        (value.rol === 'admin' || value.rol === 'empleado')
    );
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
    // El estado conserva el usuario actual y controla la espera al recuperar la sesión.
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // El efecto restaura la sesión una vez cuando se monta el proveedor.
    useEffect(() => {
        void loadUser();
    }, []);

    // La función recupera el token y verifica el usuario guardado en el dispositivo.
    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userData = await AsyncStorage.getItem('user');

            if (token && userData) {
                const storedUser: unknown = JSON.parse(userData);
                if (!isAuthUser(storedUser)) {
                    throw new Error('Stored user data is invalid.');
                }

                setUser(storedUser);
                api.defaults.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    };

    // La función valida credenciales con la API y persiste la sesión si son válidas.
    const login = async (correo: string, contrasena: string): Promise<LoginResult> => {
        try {
            const response = await api.post<LoginResponse>('/auth/login', { correo, contrasena });

            if (!response.data.success) {
                return { success: false, error: 'Error al iniciar sesión.' };
            }

            const { token, usuario } = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(usuario));
            setUser(usuario);
            api.defaults.headers.Authorization = `Bearer ${token}`;
            return { success: true };
        } catch (error) {
            const message = axios.isAxiosError<ApiErrorResponse>(error)
                ? error.response?.data?.error
                : undefined;
            return {
                success: false,
                error: message || 'Error al iniciar sesión',
            };
        }
    };

    // La función elimina la sesión local y limpia la autorización del cliente HTTP.
    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setUser(null);
        delete api.defaults.headers.Authorization;
    };

    // El proveedor comparte el estado y las acciones con las pantallas descendientes.
    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    // El error identifica el uso del hook fuera del proveedor requerido.
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider.');
    }
    return context;
};