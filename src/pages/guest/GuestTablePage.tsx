import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Button,
  Chip,
  Grid,
  Fade
} from '@mui/material';
import {
  ArrowBack,
  TableRestaurant,
  EventSeat,
  Storefront,
} from '@mui/icons-material';
import { tableService } from '../../services/tableService';
import type { Table } from '../../types';

export default function GuestTablePage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasLoaded = useRef(false);

  const loadTables = useCallback(async () => {
    try {
      if (!hasLoaded.current) setLoading(true);

      const data = await tableService.getAll();
      setTables(data);
      hasLoaded.current = true;
      setError('');
    } catch {
      if (!hasLoaded.current) setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
  }, [loadTables]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          bgcolor: '#ECFDF5',
          color: '#059669',
          border: '#A7F3D0',
          icon: <EventSeat sx={{ fontSize: 40, opacity: 0.2 }} />,
          label: 'Available'
        };
      case 'occupied':
        return {
          bgcolor: '#F3F4F6',
          color: '#4B5563',
          border: '#E5E7EB',
          icon: <TableRestaurant sx={{ fontSize: 40, opacity: 0.2 }} />,
          label: 'Occupied'
        };
      default:
        return {
          bgcolor: '#F9FAFB',
          color: '#9CA3AF',
          border: '#E5E7EB',
          icon: <TableRestaurant />,
          label: 'Unknown'
        };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F9FAFB' }}>
        <CircularProgress size={40} sx={{ color: '#1F2937' }} />
        <Typography variant="body2" color="text.secondary">Loading restaurant status...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Box sx={{ bgcolor: '#1F2937', color: 'white', py: 6, px: 3, mb: 4, boxShadow: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Storefront sx={{ fontSize: 32, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                  RestaurantPOS
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Staff Login
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 700, color: '#374151' }}>
            Legend:
          </Typography>
          {['available', 'occupied', 'reserved'].map((status) => {
            const config = getStatusConfig(status);
            return (
              <Chip
                key={status}
                label={config.label}
                sx={{
                  bgcolor: config.bgcolor,
                  color: config.color,
                  fontWeight: 700,
                  border: `1px solid ${config.border}`,
                  '& .MuiChip-label': { px: 2 }
                }}
              />
            );
          })}
        </Paper>

        <Grid container spacing={3}>
          {tables.map((table) => {
            const config = getStatusConfig(table.status);
            return (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={table.id}>
                <Fade in={true} timeout={500}>
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'relative',
                      height: 140,
                      borderRadius: 3,
                      border: `1px solid ${config.border}`,
                      bgcolor: 'white',
                      overflow: 'hidden',
                      cursor: 'default',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: config.color
                      }
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      right: -10,
                      bottom: -10,
                      color: config.color,
                      transform: 'rotate(-15deg)'
                    }}>
                      {config.icon}
                    </Box>

                    <Box sx={{
                      height: 6,
                      width: '100%',
                      bgcolor: config.color,
                      opacity: 0.8
                    }} />

                    <Box sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pb: 4
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#1F2937' }}>
                        {table.table_number}
                      </Typography>
                      <Chip
                        size="small"
                        label={config.label}
                        sx={{
                          mt: 1,
                          height: 24,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: config.bgcolor,
                          color: config.color
                        }}
                      />
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}