// src/components/layout/SimpleHeader.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SimpleHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        {/* Логотип */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <span style={{ color: '#EDAB00' }}>Task</span>
            <span style={{ color: 'black' }}>Tracker</span>
          </Typography>
        </Box>

        {/* Кнопки входа/регистрации */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/login')}
            sx={{ 
              borderColor: '#EDAB00', 
              color: '#EDAB00',
              '&:hover': {
                borderColor: '#d69b00',
                backgroundColor: 'rgba(237, 171, 0, 0.04)'
              }
            }}
          >
            Вход
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/register')}
            sx={{ 
              backgroundColor: '#EDAB00',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Регистрация
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default SimpleHeader;