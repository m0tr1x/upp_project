// src/components/layout/Sidebar.tsx
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import {
  Dashboard,
  Task,
  Folder,
  ViewKanban,
  Analytics,
  Timer,
  CalendarToday,
  Settings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Дашборд', icon: Dashboard, path: '/dashboard' },
  { text: 'Мои задачи', icon: Task, path: '/tasks' },
  { text: 'Проекты', icon: Folder, path: '/projects' },
  { text: 'Моя доска', icon: ViewKanban, path: '/myboard' },
  { text: 'Аналитика', icon: Analytics, path: '/analytics' },
  { text: 'Тайм-трекинг', icon: Timer, path: '/timer' },
  { text: 'Календарь', icon: CalendarToday, path: '/calendar' },
  { text: 'Настройки', icon: Settings, path: '/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        width: '250px',
        backgroundColor: 'black',
        color: 'white',
        height: 'calc(100vh - 64px)', // Высота минус хедер
        position: 'fixed',
        left: 0,
        top: '64px', // Начинается после хедера
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        overflowY: 'auto'
      }}
    >
      

      {/* Список пунктов меню */}
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isSelected ? '#EDAB00' : 'transparent',
                  color: isSelected ? 'black' : 'white',
                  '&:hover': {
                    backgroundColor: isSelected ? '#d69b00' : 'rgba(237, 171, 0, 0.1)',
                    color: isSelected ? 'black' : '#EDAB00'
                  },
                  transition: 'all 0.2s ease',
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: isSelected ? 'black' : '#EDAB00'
                }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isSelected ? '600' : '400'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Футер меню */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 0, 
        right: 0, 
        px: 3,
        textAlign: 'center'
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.75rem'
          }}
        >
          TaskTracker v1.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;