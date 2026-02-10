import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
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
  CheckCircle,
  SaveOutlined
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { useAuthStore } from '../../store/authStore';
import type { Order, Food, OrderItem, Table } from '../../types';

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { tableId: routeTableId } = useParams<{ tableId: string }>();
  const [searchParams] = useSearchParams();
  const tableId = routeTableId || searchParams.get('tableId');
  const user = useAuthStore((state) => state.user);

  const [table, setTable] = useState<Table | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<Food[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      let existingOrders = await orderService.getByTableAndStatus(Number(tableId), 'open');
      if (!existingOrders || existingOrders.length === 0) {
        existingOrders = await orderService.getByTableAndStatus(Number(tableId), 'pending');
      }
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
      if (!order || order.id === 0) {
        const newItems = order?.items ? [...order.items] : [];
        const existingItemIndex = newItems.findIndex(item => item.food_id === food.id);

        if (existingItemIndex >= 0) {
          const existingItem = newItems[existingItemIndex];
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
            subtotal: (existingItem.quantity + 1) * existingItem.price
          };
        } else {
          const newItem: OrderItem = {
            id: Date.now(),
            food_id: food.id,
            food: food,
            quantity: 1,
            price: food.price,
            subtotal: food.price
          };
          newItems.push(newItem);
        }

        const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

        setOrder({
          id: order?.id || 0,
          table_id: Number(tableId),
          table: table || { id: Number(tableId), table_number: tableId || '', status: 'occupied' },
          user: user || { id: 0, name: '' },
          status: 'pending',
          items: newItems,
          total: newTotal,
          created_at: new Date().toISOString()
        });
        orderSavedRef.current = false;
        return;
      }

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleUpdateQuantity = async (item: OrderItem, delta: number) => {
    if (!order) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      if (order.id === 0) {
        const newItems = order.items.map(i => {
          if (i.food_id === item.food_id) {
            return { ...i, quantity: newQuantity, subtotal: newQuantity * i.price };
          }
          return i;
        });
        const newTotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);
        setOrder({ ...order, items: newItems, total: newTotal });
        orderSavedRef.current = false;
        return;
      }

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
      if (order.id === 0) {
        const newItems = order.items.filter(i => i.id !== itemId);
        const newTotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);
        setOrder({ ...order, items: newItems, total: newTotal });
        orderSavedRef.current = false;
        return;
      }

      orderSavedRef.current = false;
      const updatedOrder = await orderService.removeItem(order.id, itemId);
      setOrder(updatedOrder);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const saveLocalOrderToBackend = async () => {
    if (!order || order.items.length === 0) return null;
    let finalOrder = order;

    if (order.id === 0) {
      const newOrder = await orderService.create(Number(tableId));
      for (const item of order.items) {
        await orderService.addItem(newOrder.id, {
          food_id: item.food_id,
          quantity: item.quantity
        });
      }
      finalOrder = await orderService.getById(newOrder.id);
      setOrder(finalOrder);
      orderIdRef.current = finalOrder.id;
    }
    return finalOrder;
  };

  const handleSendToKitchen = async () => {
    if (!order) return;

    try {
      setLoading(true);
      let targetOrder = order;

      if (order.id === 0) {
        const savedOrder = await saveLocalOrderToBackend();
        if (savedOrder) targetOrder = savedOrder;
      }
      if (targetOrder && targetOrder.status === 'pending') {
        await orderService.activate(targetOrder.id);
      }

      orderSavedRef.current = true;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send order');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (order && order.id === 0) {
        setLoading(true);
        await saveLocalOrderToBackend();
      }
      orderSavedRef.current = true;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save draft');
      setLoading(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!order) return;
    try {
      if (order.id === 0) {
        setOrder(null);
        orderSavedRef.current = true;
        navigate('/dashboard');
        return;
      }
      await orderService.close(order.id);
      orderSavedRef.current = true;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close order');
    }
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
                  bgcolor: order?.status === 'open' ? '#DBEAFE' : order?.status === 'pending' ? '#FEF3C7' : '#F3F4F6',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: order?.status === 'open' ? '#1E40AF' : order?.status === 'pending' ? '#D97706' : '#4B5563'
                }}>
                  {order?.status === 'open' ? 'Open' : order?.status === 'pending' ? 'Draft' : 'New Order'}
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
                  disabled={!order?.items || order.items.length === 0}
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
                    disabled={!order?.items || order.items.length === 0 || order?.status === 'open'}
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
                    startIcon={<CheckCircle />}
                    onClick={handleCloseOrder}
                    disabled={!order?.items || order.items.length === 0 || order?.status === 'pending'}
                    sx={{
                      borderColor: order?.status === 'pending' ? '#E5E7EB' : '#10B981',
                      color: order?.status === 'pending' ? '#9CA3AF' : '#10B981',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 1,
                      '&:hover': {
                        borderColor: order?.status === 'pending' ? '#E5E7EB' : '#059669',
                        bgcolor: order?.status === 'pending' ? 'transparent' : '#ECFDF5'
                      }
                    }}
                  >
                    Close Order
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