import api from './api';
import type { User, ApiResponse } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/login', {
      email,
      password,
    });
    return response.data.data;
  },
  
  logout: async () => {
    await api.post('/logout');
  },
  
  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/me');
    return response.data.data.user;
  },
};
