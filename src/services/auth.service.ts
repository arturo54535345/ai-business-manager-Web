import {api} from './api';
import type { AuthResponse, User } from '../types';

export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    password: string;
    name: string;
}
export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse>{
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },
    
    async register(data: RegisterData): Promise<AuthResponse>{
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },
    async getCurrentUser(): Promise<User>{
        const response = await api.get<User>('/auth/me');
        return response.data;
    },
    async updatePreferences(preferences: Partial<User['preferences']>): Promise<User> {
        // 👇 SOLUCIÓN: Quitamos las llaves {} que envolvían a 'preferences'
        // Así enviamos los datos puros y el Backend los entiende a la primera.
        const response = await api.put<User>('/auth/preferences', preferences);
        return response.data;
    },

    logout(){
        localStorage.removeItem('auth_token');
    },
};