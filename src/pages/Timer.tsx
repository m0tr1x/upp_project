// src/pages/Timer.tsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';

const Timer: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Тайм-трекинг
      </Typography>

      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <TimerIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            В разработке
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Скоро здесь появится тайм-трекинг
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Timer;