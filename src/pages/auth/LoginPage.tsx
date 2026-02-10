import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  RestaurantMenu, 
  Visibility, 
  VisibilityOff, 
  Storefront,
  ArrowForward 
} from '@mui/icons-material';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const themeColor = '#1F2937'; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await authService.login(email, password);
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
      
      <Grid 
        size={{ md: 7, lg: 8 }} 
        sx={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${themeColor}CC 0%, #111827EE 100%)`, // Transparansi tema
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 8,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, display: 'flex' }}>
                <RestaurantMenu sx={{ fontSize: 32, color: themeColor }} />
            </Box>
            <Typography variant="h4" fontWeight={800} letterSpacing={1}>
              RestaurantPOS
            </Typography>
          </Box>
        </Box>
      </Grid>

      <Grid 
        size={{ xs: 12, md: 5, lg: 4 }} 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#F9FAFB' 
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, sm: 6 }, 
            width: '100%', 
            maxWidth: 500,
            bgcolor: 'transparent'
          }}
        >
          <Box sx={{ mb: 4, display: { md: 'none' }, textAlign: 'center' }}>
            <RestaurantMenu sx={{ fontSize: 48, color: themeColor, mb: 1 }} />
            <Typography variant="h5" fontWeight={800} color={themeColor}>
              RestaurantPOS
            </Typography>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" fontWeight={800} color={themeColor} gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please enter your details to sign in.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} color={themeColor} sx={{ mb: 1 }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                placeholder="admin@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: themeColor,
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" fontWeight={600} color={themeColor} sx={{ mb: 1 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: themeColor,
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.8, 
                bgcolor: themeColor,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(31, 41, 55, 0.2)',
                '&:hover': {
                  bgcolor: '#111827',
                  boxShadow: '0 6px 16px rgba(31, 41, 55, 0.3)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Are you a customer?
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/guest/tables')}
              startIcon={<Storefront />}
              endIcon={<ArrowForward />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: themeColor,
                borderColor: '#E5E7EB',
                px: 3,
                '&:hover': {
                  borderColor: themeColor,
                  bgcolor: 'transparent'
                }
              }}
            >
              View Tables as Guest
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}