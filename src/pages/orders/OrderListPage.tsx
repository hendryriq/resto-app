import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Divider,
  Grow,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle,
  Search,
  Restaurant,
  PendingActions,
  ReceiptLong,
  AccessTime,
  TableRestaurant
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ViewToggle from '../../components/common/ViewToggle';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';

export default function OrderListPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(query) ||
        order.table.table_number.toLowerCase().includes(query)
      );
    } else {
      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    if (order.status === 'closed') {
      navigate(`/orders/${order.id}/view`);
    } else {
      navigate(`/orders/new?tableId=${order.table_id}`);
    }
  };

  const handleCloseOrder = async (orderId: number) => {
    try {
      await orderService.close(orderId);
      fetchOrders();
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      setError(error.response?.data?.message || 'Failed to close order');
    }
  };

  const formatCurrency = (amount: number) => `$${Number(amount).toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { main: '#3B82F6', light: '#EFF6FF', label: 'Active' };
      case 'pending': return { main: '#F59E0B', light: '#FFFBEB', label: 'Draft' };
      case 'closed': return { main: '#10B981', light: '#ECFDF5', label: 'Completed' };
      default: return { main: '#9CA3AF', light: '#F3F4F6', label: status };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress size={50} sx={{ color: '#1F2937' }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: { xs: 2, md: 4 } }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
              Orders
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              Manage and track all dining orders
            </Typography>
          </Box>
          <ViewToggle />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            mb: 4,
            bgcolor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
            <TextField
              fullWidth
              placeholder="Search by Order ID or Table Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F9FAFB',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#D1D5DB' },
                  '&.Mui-focused fieldset': { borderColor: '#1F2937' }
                }
              }}
            />
          </Box>
          <Tabs
            value={statusFilter}
            onChange={(_, newValue) => setStatusFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                minHeight: 56,
                color: '#6B7280',
                '&.Mui-selected': { color: '#1F2937' }
              },
              '& .MuiTabs-indicator': { bgcolor: '#1F2937', height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab label="Active Orders" value="open" icon={<Restaurant fontSize="small" />} iconPosition="start" />
            <Tab label="Drafts" value="pending" icon={<PendingActions fontSize="small" />} iconPosition="start" />
            <Tab label="History" value="closed" icon={<CheckCircle fontSize="small" />} iconPosition="start" />
            <Tab label="All Orders" value="all" icon={<ReceiptLong fontSize="small" />} iconPosition="start" />
          </Tabs>
        </Paper>

        {filteredOrders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 3, border: '1px dashed #E5E7EB' }}>
            <ReceiptLong sx={{ fontSize: 60, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
              No orders found
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Try adjusting your filters or create a new order from the Floor Plan.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusColor(order.status);

              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={order.id}>
                  <Grow in={true} timeout={(index + 1) * 200}>
                    <Card
                      elevation={0}
                      onClick={() => handleViewOrder(order)}
                      sx={{
                        border: '1px solid #E5E7EB',
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        borderLeft: `5px solid ${statusConfig.main}`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.1)',
                          borderColor: '#D1D5DB'
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, letterSpacing: 0.5 }}>
                              ORDER #{order.id}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mt: 0.5 }}>
                              {formatCurrency(Number(order.total))}
                            </Typography>
                          </Box>
                          <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.light,
                              color: statusConfig.main,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              height: 28,
                              borderRadius: 1.5
                            }}
                          />
                        </Box>

                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4B5563', bgcolor: '#F9FAFB', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
                            <TableRestaurant fontSize="small" sx={{ fontSize: 16 }} />
                            <Typography variant="body2" fontWeight={600}>Table {order.table.table_number}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4B5563', bgcolor: '#F9FAFB', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
                            <Restaurant fontSize="small" sx={{ fontSize: 16 }} />
                            <Typography variant="body2" fontWeight={600}>{order.items?.length || 0} Items</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9CA3AF', mt: 2 }}>
                          <AccessTime fontSize="small" sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight={500}>
                            {formatDate(order.created_at)}
                          </Typography>
                        </Box>
                      </CardContent>

                      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: '#E5E7EB',
                            color: '#374151',
                            '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
                          }}
                        >
                          View Details
                        </Button>

                        {order.status === 'open' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => { e.stopPropagation(); handleCloseOrder(order.id); }}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              bgcolor: '#10B981',
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#059669', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }
                            }}
                          >
                            Close Order
                          </Button>
                        )}
                      </Box>
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
}