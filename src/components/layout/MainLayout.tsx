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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Хедер - всегда сверху */}
      <MainHeader />
      
      {/* Основной контент с сайдбаром */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Боковое меню */}
        <Sidebar />
        
        {/* Основная область контента */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            ml: '250px', // Отступ равный ширине сайдбара
            p: 3,
            minWidth: 0 // Для корректного отображения контента
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;