import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Restaurant, Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <Box 
      sx={{ 
        // Memaksa box mengambil seluruh ukuran layar browser
        height: '100vh', 
        width: '100vw',
        
        // Teknik Centering Flexbox
        display: 'flex', 
        alignItems: 'center',      // Tengah Vertikal
        justifyContent: 'center',  // Tengah Horizontal
        
        bgcolor: 'grey.100',
        
        // Reset posisi agar tidak terpengaruh margin bawaan browser
        position: 'fixed', 
        top: 0,
        left: 0,
        m: 0,
        p: 0,
        overflow: 'hidden' // Mencegah scrollbar muncul
      }}
    >
      <Card 
        sx={{ 
          p: 4, 
          // Mengatur lebar card manual (pengganti Container xs)
          width: '100%', 
          maxWidth: 400, 
          boxShadow: 3, 
          borderRadius: 2,
          mx: 2 // Margin horizontal agar tidak nempel tepi HP
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Restaurant sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Restaurant POS
          </Typography>
          <Typography color="text.secondary">
            Sign in to continue
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
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
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </Box>
  );
}