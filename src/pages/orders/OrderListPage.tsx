import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ViewToggle from '../../components/common/ViewToggle';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';

export default function OrderListPage() {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/new?tableId=${order.table_id}`);
  };

  const handleCloseOrder = async (orderId: number) => {
    try {
      await orderService.close(orderId);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close order');
    }
  };

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
            Order Management
          </Typography>
          
          <ViewToggle />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3,
            bgcolor: 'white', 
            border: '1px solid #E5E7EB',
            borderRadius: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              Order Status
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ 
                  bgcolor: 'white',
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                }}
              >
                <MenuItem value="all">All Orders</MenuItem>
                <MenuItem value="open">Open Orders</MenuItem>
                <MenuItem value="closed">Closed Orders</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: '#F9FAFB',
              borderRadius: 1.5
            }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#3B82F6', borderRadius: '50%' }} />
              <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                Open
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: '#F9FAFB',
              borderRadius: 1.5
            }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#10B981', borderRadius: '50%' }} />
              <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                Closed
              </Typography>
            </Box>
          </Box>
        </Paper>

        {filteredOrders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              border: '1px solid #E5E7EB',
              borderRadius: 3,
              bgcolor: 'white',
            }}
          >
            <Typography variant="h6" sx={{ color: '#9CA3AF', mb: 1, fontWeight: 600 }}>
              No orders found
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              {statusFilter !== 'all'
                ? 'Try adjusting your filter'
                : 'Orders will appear here once created'}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
            {filteredOrders.map((order) => (
              <Paper
                key={order.id}
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid #E5E7EB',
                  borderRadius: 3,
                  bgcolor: 'white',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': { 
                    borderColor: '#9CA3AF',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                }}
                onClick={() => handleViewOrder(order)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.75rem', mb: 0.5 }}>
                      ORDER
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                      #{order.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={order.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: order.status === 'open' ? '#DBEAFE' : '#D1FAE5',
                      color: order.status === 'open' ? '#1E40AF' : '#065F46',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid #F3F4F6' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Table
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {order.table.table_number}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Items
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {order.items?.length || 0} items
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Total
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                      {formatCurrency(order.total)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    {formatDate(order.created_at)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      startIcon={<Visibility fontSize="small" />}
                      onClick={() => handleViewOrder(order)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: '#1F2937',
                        '&:hover': { bgcolor: '#F3F4F6' },
                      }}
                    >
                      View
                    </Button>

                    {order.status === 'open' && (
                      <Button
                        size="small"
                        startIcon={<CheckCircle fontSize="small" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseOrder(order.id);
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: '#10B981',
                          '&:hover': { bgcolor: '#D1FAE5' },
                        }}
                      >
                        Close
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
