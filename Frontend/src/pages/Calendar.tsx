// src/pages/Calendar.tsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';

const Calendar: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Календарь
      </Typography>

      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <CalendarMonth sx={{ fontSize: 60, color: '#2196f3', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            В разработке
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Скоро здесь появится календарь
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Calendar;