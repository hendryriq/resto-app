import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ViewToggle from '../../components/common/ViewToggle';
import { tableService } from '../../services/tableService';
import { orderService } from '../../services/orderService';
import type { Table } from '../../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const [tablesData, pendingOrders] = await Promise.all([
        tableService.getAll(),
        orderService.getAll({ status: 'pending' })
      ]);

      const pendingTableIds = new Set(pendingOrders.map(o => o.table_id));

      const updatedTables = tablesData.map(table => ({
        ...table,
        status: pendingTableIds.has(table.id) ? 'occupied' : table.status
      }));

      setTables(updatedTables);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return '#64748B';
      case 'occupied':
        return '#475569';
      default:
        return '#E2E8F0';
    }
  };

  const stats = useMemo(() => {
    return {
      available: tables.filter(t => t.status === 'available').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
    };
  }, [tables]);

  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      navigate(`/orders/new?tableId=${table.id}`);
    } else {
      navigate(`/orders/${table.id}`);
    }
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

  return (
    <DashboardLayout>
      <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: 3 }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
            Table Management
          </Typography>

          <ViewToggle />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#374151', mb: 2, fontWeight: 600 }}>
            Table Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Available', color: getStatusColor('available') },
              { label: 'Occupied', color: getStatusColor('occupied') },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: item.color }} />
                <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            minHeight: '60vh'
          }}
        >
          <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', lg: 'row' } }}>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(4, 1fr)',
                    md: 'repeat(6, 1fr)',
                  },
                  gap: 2.5
                }}
              >
                {tables.map((table) => (
                  <Paper
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    elevation={0}
                    sx={{
                      bgcolor: getStatusColor(table.status),
                      color: 'white',
                      aspectRatio: '5/4',
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      },
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {table.table_number}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            <Box sx={{ width: { xs: '100%', lg: 280 }, flexShrink: 0 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#111827' }}>
                Quick Stats
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Available Tables', value: stats.available },
                  { label: 'Occupied Tables', value: stats.occupied }
                ].map((stat) => (
                  <Paper
                    key={stat.label}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid #F1F5F9',
                      bgcolor: '#F8FAFC',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: '#F1F5F9'
                      }
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}