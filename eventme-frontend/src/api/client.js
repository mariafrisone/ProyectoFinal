import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = Platform.OS === 'web' 
? 'http://localhost:3000/api'
: 'http://192.168.1.199:3000/api';

const TOKEN_KEY = 'user_jwt_token';

export const saveToken = async (token) => {
    try{
        if (Platform.OS === 'web') {
            localStorage.setItem(TOKEN_KEY, token);
        }else{
             await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
    }catch (error){
        console.error('Error al guardar token:', error)
    }
};

export const getToken = async () => {
    try{
        if (Platform.OS === 'web') {
            return localStorage.getItem(TOKEN_KEY);            
        }else{
            return await SecureStore.getItemAsync(TOKEN_KEY);
        }       
    }catch(error){
        console.error('Error al obtener token:', error);
        return null;
    }
};

export const removeToken = async () => {
    try{
        if (Platform.OS === 'web') {
            localStorage.removeItem(TOKEN_KEY);            
        }else{
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
    }catch(error){
        console.error('Error al eliminar el token:', error);
    }
};

export const apiRequest = async (endpoint, method = 'GET', data = null, requiresAuth = false) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth){
        const token = await getToken();
        if (token){
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const config = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')){
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok){
        throw new Error(result.error || result.message || 'Error en la petición');
    }

    return result;
}
