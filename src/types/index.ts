export interface User {
  id: number;
  name: string;
  email: string;
  role: 'pelayan' | 'kasir';
}

export interface Table {
  id: number;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  capacity?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  menu_item: MenuItem;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: number;
  table_id: number;
  table: Table;
  order_number: string;
  status: 'draft' | 'open' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
  created_at: string;
  updated_at: string;
}
