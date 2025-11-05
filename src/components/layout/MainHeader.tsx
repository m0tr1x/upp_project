// src/components/layout/MainHeader.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  InputBase,
  Badge,
  Avatar,
  IconButton,
  Button
} from '@mui/material';
import { Search, Notifications } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MainHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
            onClick={() => navigate('/dashboard')}
          >
            <span style={{ color: '#EDAB00' }}>Task</span>
            <span style={{ color: 'black' }}>Tracker</span>
          </Typography>
        </Box>

        {/* Поиск */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            minWidth: 400,
            border: '1px solid #e0e0e0'
          }}
        >
          <Search sx={{ color: '#EDAB00', mr: 1 }} />
          <InputBase
            placeholder="Поиск задач, проектов..."
            sx={{
              flex: 1,
              '& .MuiInputBase-input': {
                padding: '4px 0',
              }
            }}
          />
        </Box>

        {/* Уведомления и профиль */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          
          {/* Иконка уведомлений */}
          <IconButton sx={{ color: 'black' }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Профиль пользователя */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: '#EDAB00',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: '500',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleLogout}
              sx={{ ml: 1 }}
            >
              Выйти
            </Button>
          </Box>
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default MainHeader;