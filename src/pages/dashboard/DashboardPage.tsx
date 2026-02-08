import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import {
  GridView as FloorPlanIcon,
  FormatListBulleted as ListViewIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { tableService } from '../../services/tableService';
import type { Table } from '../../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'floor' | 'list'>('floor');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getAll();
      setTables(data);
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
      case 'reserved':
        return '#94A3B8';
      case 'inactive':
        return '#CBD5E1';
      default:
        return '#E2E8F0';
    }
  };

  const stats = useMemo(() => {
    return {
      available: tables.filter(t => t.status === 'available').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      reserved: tables.filter(t => t.status === 'reserved').length,
      inactive: tables.filter(t => t.status === 'inactive').length,
    };
  }, [tables]);

  const handleTableClick = (table: Table) => {
    if (table.status === 'inactive') return;
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Table Management
          </Typography>
          
          <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #E5E7EB', p: 0.5 }}>
            <Button
              startIcon={<FloorPlanIcon />}
              onClick={() => setViewMode('floor')}
              sx={{
                bgcolor: viewMode === 'floor' ? '#1F2937' : 'transparent',
                color: viewMode === 'floor' ? 'white' : '#6B7280',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                px: 2,
                '&:hover': { bgcolor: viewMode === 'floor' ? '#111827' : '#F3F4F6' }
              }}
            >
              Floor Plan
            </Button>
            <Button
              startIcon={<ListViewIcon />}
              onClick={() => setViewMode('list')}
              sx={{
                bgcolor: viewMode === 'list' ? '#1F2937' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#6B7280',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                px: 2,
                '&:hover': { bgcolor: viewMode === 'list' ? '#111827' : '#F3F4F6' }
              }}
            >
              List View
            </Button>
          </Box>
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
              { label: 'Reserved', color: getStatusColor('reserved') },
              { label: 'Inactive', color: getStatusColor('inactive') },
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
              {viewMode === 'floor' ? (
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
                        cursor: table.status === 'inactive' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: table.status !== 'inactive' ? 'translateY(-4px)' : 'none',
                          boxShadow: table.status !== 'inactive' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                        },
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {table.table_number}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', color: '#6B7280' }}>
                  List view content goes here
                </Box>
              )}
            </Box>

            <Box sx={{ width: { xs: '100%', lg: 280 }, flexShrink: 0 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#111827' }}>
                Quick Stats
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Available Tables', value: stats.available },
                  { label: 'Occupied Tables', value: stats.occupied },
                  { label: 'Reserved Tables', value: stats.reserved },
                  { label: 'Inactive Tables', value: stats.inactive },
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
      </Container>
    </DashboardLayout>
  );
}