// src/pages/Settings.tsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const Settings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Настройки
      </Typography>

      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <SettingsIcon sx={{ fontSize: 60, color: '#9c27b0', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            В разработке
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Скоро здесь появятся настройки
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;