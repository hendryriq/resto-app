import api from './api';
import type { Food, ApiResponse } from '../types';

export const menuService = {
  getAll: async (category?: string) => {
    const params = category ? `?category=${category}` : '';
    const response = await api.get<ApiResponse<Food[]>>(`/foods${params}`);
    return response.data.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Food>>(`/foods/${id}`);
    return response.data.data;
  },
  
  create: async (foodData: Omit<Food, 'id'>) => {
    const response = await api.post<ApiResponse<Food>>('/foods', foodData);
    return response.data.data;
  },
  
  update: async (id: number, foodData: Partial<Food>) => {
    const response = await api.put<ApiResponse<Food>>(`/foods/${id}`, foodData);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/foods/${id}`);
  },
};
