import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  DeleteOutline,
  NoteAltOutlined,
  Search,
  Send,
  Print,
  SaveOutlined
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { useAuthStore } from '../../store/authStore';
import type { Order, Food, OrderItem, Table } from '../../types';

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const user = useAuthStore((state) => state.user);

  const [table, setTable] = useState<Table | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<Food[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const orderSavedRef = useRef(false);
  const orderIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (tableId) {
      initializeOrder();
    }
  }, [tableId]);

  useEffect(() => {
    return () => {
      if (orderIdRef.current && !orderSavedRef.current) {
        orderService.delete(orderIdRef.current).catch(err => {
          console.error('Failed to delete unsaved order:', err);
        });
      }
    };
  }, []);

  const initializeOrder = async () => {
    try {
      setLoading(true);
      const menuData = await menuService.getAll();
      setMenuItems(menuData);
      
      const uniqueCategories = Array.from(new Set(menuData.map(item => item.category)))
        .filter((cat): cat is string => cat !== null);
      setCategories(uniqueCategories);
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
      
      const existingOrders = await orderService.getByTableAndStatus(Number(tableId), 'open');
      if (existingOrders && existingOrders.length > 0) {
        const existingOrder = existingOrders[0];
        setOrder(existingOrder);
        setTable(existingOrder.table);
        orderIdRef.current = existingOrder.id;
        orderSavedRef.current = true;
      }
      
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (food: Food) => {
    try {
      if (!order) {
        const newOrder = await orderService.create(Number(tableId));
        setOrder(newOrder);
        setTable(newOrder.table);
        orderIdRef.current = newOrder.id;
        orderSavedRef.current = false;
        const updatedOrder = await orderService.addItem(newOrder.id, {
          food_id: food.id,
          quantity: 1,
        });
        setOrder(updatedOrder);
      } else {
        orderSavedRef.current = false;
        const existingItem = order.items.find(item => item.food_id === food.id);
        if (existingItem) {
          const updatedOrder = await orderService.updateItem(
            order.id, 
            existingItem.id, 
            existingItem.quantity + 1
          );
          setOrder(updatedOrder);
        } else {
          const updatedOrder = await orderService.addItem(order.id, {
            food_id: food.id,
            quantity: 1,
          });
          setOrder(updatedOrder);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleUpdateQuantity = async (item: OrderItem, delta: number) => {
    if (!order) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    try {
      orderSavedRef.current = false;
      const updatedOrder = await orderService.updateItem(order.id, item.id, newQuantity);
      setOrder(updatedOrder);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!order) return;
    try {
      orderSavedRef.current = false;
      const updatedOrder = await orderService.removeItem(order.id, itemId);
      setOrder(updatedOrder);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleSendToKitchen = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      await orderService.close(order.id);
      orderSavedRef.current = true;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDraft = () => {
    if (order) {
      orderSavedRef.current = true;
    }
    navigate('/dashboard');
  };

  const filteredMenuItems = menuItems
    .filter(item => item.category === selectedCategory)
    .filter(item => 
      searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ color: '#111827' }}>
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                            {table?.table_number || `Table ${tableId}`}
                        </Typography>
                        <Box sx={{ 
                            bgcolor: '#F3F4F6', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            color: '#4B5563' 
                        }}>
                            New Order
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1F2937' }} src="/broken-image.jpg" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
            </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 140px)' }}>
          {/* LEFT SIDE: MENU */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Category Tabs */}
            <Box sx={{ mb: 2 }}>
                <Tabs 
                    value={selectedCategory} 
                    onChange={(_, newValue) => setSelectedCategory(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 40,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            minHeight: 40,
                            borderRadius: '8px',
                            mr: 1,
                            color: '#6B7280',
                            transition: 'all 0.2s',
                            '&.Mui-selected': {
                                color: 'white',
                                bgcolor: '#1F2937',
                            },
                        },
                        '& .MuiTabs-indicator': { display: 'none' },
                    }}
                >
                    {categories.map(category => (
                        <Tab key={category} label={category} value={category} disableRipple />
                    ))}
                </Tabs>
            </Box>

            {/* Search Bar */}
            <TextField
                fullWidth
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                    mb: 3,
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#D1D5DB' },
                        '&.Mui-focused fieldset': { borderColor: '#1F2937' },
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search sx={{ color: '#9CA3AF' }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Menu List */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredMenuItems.map(item => (
                        <Box key={item.id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    border: '1px solid #E5E7EB',
                                    borderRadius: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: '#9CA3AF' }
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1, maxWidth: '80%' }}>
                                        {item.description}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                                        ${Number(item.price).toFixed(2)}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    onClick={() => handleAddItem(item)}
                                    sx={{ 
                                        bgcolor: '#1F2937', 
                                        color: 'white',
                                        borderRadius: 2, // Kotak tumpul
                                        width: 44,
                                        height: 44,
                                        '&:hover': { bgcolor: '#000' }
                                    }}
                                >
                                    <Add />
                                </IconButton>
                            </Paper>
                        </Box>
                    ))}
                </Box>
            </Box>
          </Box>

          <Box sx={{ width: 420, display: 'flex', flexDirection: 'column' }}>
            <Paper 
                elevation={0}
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB'
                }}
            >
                <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        Current Order
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                        Table {table?.table_number || tableId} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Typography>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                    {!order?.items || order.items.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: '#9CA3AF' }}>
                            <Typography>No items selected</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {order.items.map(item => (
                                <Box key={item.id}>
                                    {/* Baris 1: Nama & Harga */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                                            {item.food.name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#111827' }}>
                                            ${item.subtotal.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            border: '1px solid #E5E7EB', 
                                            borderRadius: 2,
                                            p: 0.5
                                        }}>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleUpdateQuantity(item, -1)}
                                                disabled={item.quantity <= 1}
                                                sx={{ width: 28, height: 28 }}
                                            >
                                                <Remove fontSize="small" sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <Typography sx={{ mx: 1.5, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton 
                                                size="small"
                                                onClick={() => handleUpdateQuantity(item, 1)}
                                                sx={{ width: 28, height: 28 }}
                                            >
                                                <Add fontSize="small" sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>

                                        <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                                            <NoteAltOutlined fontSize="small" />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleRemoveItem(item.id)}
                                            sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}
                                        >
                                            <DeleteOutline fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                <Box sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid #F3F4F6' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>Total:</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                            ${order?.total.toFixed(2) || '0.00'}
                        </Typography>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Send />}
                        onClick={handleSendToKitchen}
                        disabled={!order?.items || order.items.length === 0 || actionLoading}
                        sx={{
                            bgcolor: '#1F2937', // Black color
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1.5,
                            borderRadius: 2,
                            mb: 2,
                            '&:hover': { bgcolor: '#111827' }
                        }}
                    >
                        Send to Kitchen
                    </Button>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SaveOutlined />}
                            onClick={handleSaveDraft}
                            disabled={!order?.items || order.items.length === 0}
                            sx={{
                                borderColor: '#E5E7EB',
                                color: '#374151',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                py: 1,
                                '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                            }}
                        >
                            Save Draft
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Print />}
                            onClick={() => window.print()}
                            disabled={!order?.items || order.items.length === 0}
                            sx={{
                                borderColor: '#E5E7EB',
                                color: '#374151',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                py: 1,
                                '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                            }}
                        >
                            Print Bill
                        </Button>
                    </Box>
                </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}