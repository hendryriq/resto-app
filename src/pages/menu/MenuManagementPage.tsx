import { useState, useEffect, useMemo } from 'react';
import { AxiosError } from 'axios';
import type { Food, ApiErrorResponse } from '../../types';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search as SearchIcon,
  RestaurantMenu,
  ImageNotSupported,
  Close as CloseIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { menuService } from '../../services/menuService';

interface FoodFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  available: boolean;
}

const initialFormData: FoodFormData = {
  name: '',
  description: '',
  price: 0,
  category: 'Main Course',
  image_url: '',
  available: true,
};

const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads'];

export default function MenuManagementPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  // filteredFoods is now derived via useMemo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentFood, setCurrentFood] = useState<Food | null>(null);
  const [formData, setFormData] = useState<FoodFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    fetchFoods();
  }, []);

  const filteredFoods = useMemo(() => {
    let filtered = foods;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(food => food.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [foods, searchQuery, categoryFilter]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAll();
      setFoods(data);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      setError(error.response?.data?.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setDialogMode('add');
    setCurrentFood(null);
    setFormData(initialFormData);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEditClick = (food: Food) => {
    setDialogMode('edit');
    setCurrentFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      price: Number(food.price),
      category: food.category || 'Main Course',
      image_url: food.image_url || '',
      available: food.available ?? true,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentFood(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Name is required (min 3 chars)';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaveLoading(true);
      setError('');

      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      if (dialogMode === 'add') {
        const createPayload = { ...payload } as Omit<Food, 'id'>; // Explicit cast to satisfy type checker if needed, or just pass payload
        await menuService.create(createPayload);
      } else if (currentFood) {
        await menuService.update(currentFood.id, payload);
      }

      await fetchFoods();
      handleDialogClose();
    } catch (err: unknown) {
      console.error('Save error:', err);
      const error = err as AxiosError<ApiErrorResponse>;
      setError(error.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteClick = (food: Food) => {
    setFoodToDelete(food);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!foodToDelete) return;

    try {
      setDeleteLoading(true);
      setError('');
      await menuService.delete(foodToDelete.id);
      await fetchFoods();
      setDeleteDialogOpen(false);
      setFoodToDelete(null);
      setFoodToDelete(null);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      setError(error.response?.data?.message || 'Failed to delete menu item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Appetizers': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Main Course': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Desserts': return { bg: '#FCE7F3', text: '#DB2777' };
      case 'Beverages': return { bg: '#E0E7FF', text: '#4F46E5' };
      case 'Salads': return { bg: '#D1FAE5', text: '#059669' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
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
      <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: { xs: 2, md: 3 } }}>

        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
              Menu Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Manage your restaurant's food and beverage offerings
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClick}
            sx={{
              bgcolor: '#1F2937',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              '&:hover': { bgcolor: '#111827', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
            }}
          >
            Add New Item
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filter Section */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            bgcolor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <TextField
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              minWidth: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#F9FAFB',
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#D1D5DB' },
                '&.Mui-focused fieldset': { borderColor: '#1F2937' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200, flexGrow: { xs: 1, sm: 0 } }}>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 2,
                bgcolor: '#F9FAFB',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Menu Grid */}
        {filteredFoods.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 3, border: '1px dashed #E5E7EB' }}>
            <RestaurantMenu sx={{ fontSize: 60, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
              No items found
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first menu item'}
            </Typography>
            {!searchQuery && categoryFilter === 'all' && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddClick}
                sx={{
                  color: '#1F2937',
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#1F2937', bgcolor: '#F9FAFB' }
                }}
              >
                Add Item
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}>
            {filteredFoods.map((food) => {
              const catColors = getCategoryColor(food.category);
              return (
                <Card
                  key={food.id}
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.1)',
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', paddingTop: '60%' }}>
                    {food.image_url ? (
                      <CardMedia
                        component="img"
                        image={food.image_url}
                        alt={food.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9CA3AF'
                        }}
                      >
                        <ImageNotSupported />
                      </Box>
                    )}

                    {/* Status Badge */}
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip
                        label={food.available !== false ? 'Available' : 'Unavailable'}
                        size="small"
                        sx={{
                          bgcolor: food.available !== false ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          backdropFilter: 'blur(4px)',
                          height: 24
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0 }}>
                        {food.name}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={food.category}
                        size="small"
                        sx={{
                          bgcolor: catColors.bg,
                          color: catColors.text,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          borderRadius: 1
                        }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: 40
                    }}>
                      {food.description || 'No description available.'}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2937' }}>
                      ${Number(food.price).toFixed(2)}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, borderTop: '1px solid #F3F4F6', mt: 'auto', display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Edit fontSize="small" />}
                      onClick={() => handleEditClick(food)}
                      sx={{
                        borderColor: '#E5E7EB',
                        color: '#374151',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<Delete fontSize="small" />}
                      onClick={() => handleDeleteClick(food)}
                      sx={{
                        borderColor: '#FEE2E2',
                        color: '#EF4444',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { borderColor: '#FCA5A5', bgcolor: '#FEF2F2' }
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        )}

        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #E5E7EB' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {dialogMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
            </Typography>
            <IconButton onClick={handleDialogClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 3 }}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Dish Name"
                placeholder="e.g. Grilled Salmon"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Description"
                placeholder="Describe the ingredients and taste..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel shrink>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    displayEmpty
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    notched
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price === 0 ? '' : formData.price}

                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      price: val === '' ? 0 : parseFloat(val)
                    });
                  }}

                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Box>

              <TextField
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Link to an image file (JPG, PNG, WEBP)"
              />

              <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F9FAFB' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Availability</Typography>
                  <Typography variant="caption" color="text.secondary">Available for ordering?</Typography>
                </Box>
                <Switch
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                />
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleDialogClose}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#6B7280' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saveLoading}
              sx={{
                bgcolor: '#1F2937',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': { bgcolor: '#111827' }
              }}
            >
              {saveLoading ? 'Saving...' : 'Save Item'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '50%', bgcolor: '#FEE2E2',
              color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2
            }}>
              <Delete fontSize="large" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Delete Item?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Are you sure you want to delete <strong>{foodToDelete?.name}</strong>?
              This action cannot be undone.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLoading}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleDeleteConfirm}
                variant="contained"
                disabled={deleteLoading}
                color="error"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none', bgcolor: '#DC2626' }
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </Box>
          </Box>
        </Dialog>

      </Box>
    </DashboardLayout>
  );
}