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
};
