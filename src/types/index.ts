export interface User {
  id: number;
  name: string;
  email: string;
  role: 'pelayan' | 'kasir';
}

export interface Table {
  id: number;
  table_number: string;
  status: 'available' | 'occupied';
  current_order?: {
    id: number;
    total: number;
    created_at: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface Food {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category: string | null;
  image_url?: string | null;
  available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  food_id: number;
  food: Food;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  table_id: number;
  table: {
    id: number;
    table_number: string;
    status: 'available' | 'occupied';
  };
  user: {
    id: number;
    name: string;
  };
  status: 'open' | 'closed';
  items: OrderItem[];
  total: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface CreateOrderRequest {
  table_id: number;
}

export interface AddItemRequest {
  food_id: number;
  quantity: number;
}

export interface CreateFoodRequest {
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
}

export interface UpdateFoodRequest extends CreateFoodRequest {}
