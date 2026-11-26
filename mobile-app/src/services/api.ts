import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiErrorResponse } from '../types';

// La URL se obtiene del entorno y permite usar la misma app con distintos servidores.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.58:3001/api';

// El cliente fija la dirección base y el tiempo máximo de espera de cada petición.
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

console.log(`api ${API_URL}`);
api.interceptors.request.use(
    async (config) => {
        // El interceptor adjunta el token guardado para autenticar las peticiones protegidas.
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // El rechazo conserva el error para que la pantalla pueda informar del fallo.
        console.error('No se conectó al servidor', error);
        return Promise.reject(error);
    }
);

// La función obtiene el mensaje enviado por la API o conserva el texto alternativo.
export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.error || fallback;
    }

    return fallback;
}

export default api;