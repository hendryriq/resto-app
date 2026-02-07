import api from './api';
import type { User } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', {
      email,
      password,
    });
    return response.data;
  },
  
  logout: async () => {
    await api.post('/logout');
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/user');
    return response.data;
  },
};
