import api from './api';
import type { Table } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const tableService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Table[]>>('/tables');
    return response.data.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Table>>(`/tables/${id}`);
    return response.data.data;
  },
  
  updateStatus: async (id: number, status: Table['status']) => {
    const response = await api.put<ApiResponse<Table>>(`/tables/${id}/status`, { status });
    return response.data.data;
  },
};
