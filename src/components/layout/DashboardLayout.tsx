import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid #E5E7EB', 
          color: '#1F2937' 
        }}
      >
        <Toolbar sx={{ gap: 2, height: 70 }}>
          
          <Box 
            sx={{ 
              bgcolor: '#1F2937', 
              color: 'white',
              px: 2.5,
              py: 1,
              borderRadius: 2, 
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            RestaurantPOS
          </Box>

          <TextField
            size="small"
            placeholder="Search table..."
            sx={{
              width: 320,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 1.5, 
                '& fieldset': {
                  borderColor: '#E5E7EB', 
                },
                '&:hover fieldset': {
                  borderColor: '#9CA3AF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1F2937', 
                },
                '& input': {
                  color: '#374151', 
                  fontSize: '0.9rem',
                  '&::placeholder': {
                    color: '#9CA3AF',
                    opacity: 1,
                  }
                }
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 2,
              transition: '0.2s',
              '&:hover': {
                bgcolor: '#F3F4F6'
              }
            }}
            onClick={handleMenu}
          >
            <Avatar 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: '#F3F4F6',
                border: '1px solid #E5E7EB'
              }}
            />
            
            <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                {user?.role === 'pelayan' ? 'Server' : 'Cashier'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minWidth: 150
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleLogout} sx={{ fontSize: '0.9rem', color: '#EF4444', fontWeight: 500 }}>
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}