import api from './api';
import type { Order, ApiResponse } from '../types';

export const orderService = {
  create: async (tableId: number) => {
    const response = await api.post<ApiResponse<Order>>('/orders/draft', { table_id: tableId });
    return response.data.data;
  },
  
  getById: async (orderId: number) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return response.data.data;
  },
  
  getByTableAndStatus: async (tableId: number, status: string = 'open') => {
    const response = await api.get<ApiResponse<Order[]>>(`/orders?table_id=${tableId}&status=${status}`);
    return response.data.data;
  },
  
  getAll: async (filters?: { status?: string; table_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.table_id) params.append('table_id', filters.table_id.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    
    const response = await api.get<ApiResponse<Order[]>>(url);
    return response.data.data;
  },
  
  addItem: async (orderId: number, itemData: { food_id: number; quantity: number }) => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/items`, itemData);
    return response.data.data;
  },
  
  updateItem: async (orderId: number, itemId: number, quantity: number) => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/items/${itemId}`, { quantity });
    return response.data.data;
  },
  
  removeItem: async (orderId: number, itemId: number) => {
    const response = await api.delete<ApiResponse<Order>>(`/orders/${orderId}/items/${itemId}`);
    return response.data.data;
  },
  
  delete: async (orderId: number) => {
    await api.delete(`/orders/${orderId}`);
  },
  
  close: async (orderId: number) => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/close`);
    return response.data.data;
  },

  activate: async (orderId: number) => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/activate`);
    return response.data.data;
  },

  getReceipt: async (orderId: number) => {
    const response = await api.get(`/orders/${orderId}/receipt`, { responseType: 'blob' });
    return response.data;
  },
};
