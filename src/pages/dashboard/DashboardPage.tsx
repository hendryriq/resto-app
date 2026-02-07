import { Typography, Box, Container } from '@mui/material';

export default function DashboardPage() {
  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          This page will be implemented in Phase 3
        </Typography>
      </Box>
    </Container>
  );
}
