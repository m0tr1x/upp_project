// src/components/layout/MainLayout.tsx
import React from 'react';
import { Box } from '@mui/material';
import MainHeader from './MainHeader';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Фиксированный хедер */}
      <MainHeader />
      
      {/* Основной контент с сайдбаром */}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1,
        pt: '64px' // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: отступ для фиксированного header'а
      }}>
        {/* Боковое меню */}
        <Sidebar />
        
        {/* Основная область контента */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            ml: '250px', // Отступ равный ширине сайдбара
            p: 3,
            minWidth: 0, // Для корректного отображения контента
            width: 'calc(100% - 250px)' // Фиксированная ширина для контента
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;