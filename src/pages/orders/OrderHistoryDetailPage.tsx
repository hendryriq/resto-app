import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Chip
} from '@mui/material';
import {
    ArrowBack,
    Print,
    CalendarToday,
    TableRestaurant,
    Person
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';

export default function OrderHistoryDetailPage() {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const data = await orderService.getById(Number(orderId));
            setOrder(data);
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorResponse>;
            setError(error.response?.data?.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId, fetchOrder]);

    const handlePrintReceipt = async () => {
        if (!order) return;
        try {
            setLoading(true);
            const blob = await orderService.getReceipt(order.id);

            if (blob.type === 'application/json') {
                const text = await blob.text();
                const data = JSON.parse(text);
                throw new Error(data.message || 'Failed to generate receipt');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-order-${order.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.open(url, '_blank');
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorResponse | Blob>;
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const errorData = JSON.parse(text);
                    setError(errorData.message || 'Failed to generate receipt');
                    return;
                } catch {
                    // ignore parse error
                }
            }
            if (err instanceof Error) {
                setError(err.message || 'Failed to generate receipt');
            } else {
                setError('Failed to generate receipt');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => `$${Number(amount).toFixed(2)}`;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (!order) {
        return (
            <DashboardLayout>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">Order not found</Alert>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/orders')} sx={{ mt: 2 }}>
                        Back to Orders
                    </Button>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: 3 }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={() => navigate('/orders')} sx={{ mr: 2, bgcolor: 'white', border: '1px solid #E5E7EB' }}>
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                                    Order #{order.id}
                                </Typography>
                                <Chip
                                    label={order.status.toUpperCase()}
                                    color={order.status === 'closed' ? 'success' : 'default'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 16 }} />
                                {formatDate(order.created_at)}
                            </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                            <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={handlePrintReceipt}
                                sx={{ bgcolor: 'white' }}
                            >
                                Print Receipt
                            </Button>
                        </Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TableRestaurant sx={{ color: '#6B7280' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Table {order.table.table_number}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person sx={{ color: '#6B7280' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {order.user?.name || 'Staff'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ p: 0 }}>
                            {order.items.map((item, index) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        p: 3,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom: index < order.items.length - 1 ? '1px solid #F3F4F6' : 'none'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: '#F3F4F6',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                color: '#6B7280'
                                            }}
                                        >
                                            {item.quantity}x
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                                                {item.food.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                                {formatCurrency(item.price)} per item
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                                        {formatCurrency(item.subtotal)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                                    Total Amount
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                                    {formatCurrency(order.total)}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </DashboardLayout>
    );
}
