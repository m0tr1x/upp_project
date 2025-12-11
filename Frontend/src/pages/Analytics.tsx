// src/pages/Analytics.tsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { QueryStats } from '@mui/icons-material';

const Analytics: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Аналитика
      </Typography>

      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <QueryStats sx={{ fontSize: 60, color: '#EDAB00', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            В разработке
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Скоро здесь появится аналитика
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;