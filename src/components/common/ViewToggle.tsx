import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { GridViewOutlined, ViewList as ListViewIcon } from '@mui/icons-material';

export default function ViewToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isFloorPlanActive = location.pathname === '/dashboard';
  const isListViewActive = location.pathname === '/orders' || location.pathname.startsWith('/orders');

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #E5E7EB', p: 0.5 }}>
      <Button
        startIcon={<GridViewOutlined />}
        onClick={() => navigate('/dashboard')}
        sx={{
          bgcolor: isFloorPlanActive ? '#1F2937' : 'transparent',
          color: isFloorPlanActive ? 'white' : '#6B7280',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 1.5,
          px: 2,
          '&:hover': { bgcolor: isFloorPlanActive ? '#111827' : '#F3F4F6' }
        }}
      >
        Floor Plan
      </Button>
      <Button
        startIcon={<ListViewIcon />}
        onClick={() => navigate('/orders')}
        sx={{
          bgcolor: isListViewActive ? '#1F2937' : 'transparent',
          color: isListViewActive ? 'white' : '#6B7280',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 1.5,
          px: 2,
          '&:hover': { bgcolor: isListViewActive ? '#111827' : '#F3F4F6' }
        }}
      >
        List View
      </Button>
    </Box>
  );
}
