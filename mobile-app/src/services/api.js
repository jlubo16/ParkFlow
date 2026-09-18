// mobile-app/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.137.58:3001/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

console.log(`api ${API_URL}`)
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.log("No se conectó al servidor")
        return Promise.reject(error)}
);

export default api;