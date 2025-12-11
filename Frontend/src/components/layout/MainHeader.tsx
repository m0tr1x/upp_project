// src/components/layout/MainHeader.tsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  InputBase,
  Badge,
  Avatar,
  IconButton,
  Button,
  alpha
} from '@mui/material';
import { Search, Notifications } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MainHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Отслеживаем прокрутку страницы
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" // Фиксированная позиция
      sx={{ 
        backgroundColor: scrolled ? alpha('#FFFFFF', 0.95) : '#FFFFFF',
        color: 'black',
        boxShadow: scrolled 
          ? '0 4px 20px rgba(0,0,0,0.1)' 
          : '0 2px 10px rgba(0,0,0,0.1)',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1200, // Повышен z-index
        top: 0,
        left: 0,
        right: 0
      }}
    >
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between',
          minHeight: '64px', // Фиксированная высота
          px: { xs: 2, sm: 3 }
        }}
      >
        
        {/* Логотип */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              cursor: 'pointer',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
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
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            minWidth: 300,
            maxWidth: 400,
            width: '100%',
            border: '1px solid #e0e0e0',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#eeeeee',
              borderColor: '#EDAB00'
            }
          }}
        >
          <Search sx={{ color: '#EDAB00', mr: 1, fontSize: '1.2rem' }} />
          <InputBase
            placeholder="Поиск задач, проектов..."
            sx={{
              flex: 1,
              '& .MuiInputBase-input': {
                padding: '4px 0',
                fontSize: '0.9rem'
              }
            }}
          />
        </Box>

        {/* Кнопка поиска для мобильных */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton 
            size="medium"
            sx={{ 
              color: '#EDAB00',
              '&:hover': { backgroundColor: alpha('#EDAB00', 0.1) }
            }}
          >
            <Search />
          </IconButton>
        </Box>

        {/* профиль */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          

          {/* Профиль пользователя */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: '#EDAB00',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              onClick={() => navigate('/profile')}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: '600',
                  lineHeight: 1.2
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666666',
                  fontSize: '0.75rem'
                }}
              >
                {user?.email}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleLogout}
              sx={{ 
                ml: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                borderColor: '#EDAB00',
                color: '#EDAB00',
                '&:hover': {
                  borderColor: '#d69b00',
                  backgroundColor: alpha('#EDAB00', 0.04)
                }
              }}
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