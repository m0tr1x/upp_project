// src/pages/Dashboard.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button
} from '@mui/material';
import { PlayArrow, Add } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // Функция для получения приветствия по времени
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  // Функция для форматирования даты
  const getFormattedDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('ru-RU', options);
  };

  // Mock данные
  const recentTasks = [
    { id: 1, title: 'Собрать волю в кулак', project: 'Дом', status: 'In Progress', time: '30:00' },
    { id: 2, title: 'Поработать', project: 'Работа', status: 'To Do', time: '2 часа' },
    { id: 3, title: 'Проснуться', project: 'Дом', status: 'Done', time: '10:00' },
  ];

  const projects = [
    { name: 'УПП', time: '05:00:00' },
    { name: 'Дыхательные практики', time: '01:00:00' },
    { name: 'Работа', time: '08:00:00' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Шапка с приветствием и кнопкой таймера */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        {/* Приветствие и дата */}
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {getTimeBasedGreeting()}, Daria! 
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getFormattedDate()}
          </Typography>
        </Box>

        {/* Кнопка старта таймера */}
        <Button
          variant="outlined"
          startIcon={<PlayArrow />}
          sx={{
            borderColor: '#EDAB00',
            borderWidth: 2,
            backgroundColor: 'white',
            color: '#EDAB00',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            minWidth: 'auto',
            '&:hover': {
              borderColor: '#EDAB00',
              borderWidth: 2,
              backgroundColor: '#FFF9E6'
            }
          }}
        >
          Запустить таймер
        </Button>
      </Box>

      {/* Сетка */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        
        {/* Левая колонка - Основной контент */}
        <Box sx={{ flex: 2 }}>
          {/* Задачи на сегодня */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {/* Заголовок и кнопка в одной строке */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2 
              }}>
                <Typography variant="h6">
                  Задачи на сегодня
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  sx={{
                    backgroundColor: '#EDAB00',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#d69b00'
                    }
                  }}
                >
                  Добавить задачу
                </Button>
              </Box>

              {/* Список задач */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentTasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="500">
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.project} • {task.time}
                      </Typography>
                    </Box>
                    <Chip
                      label={task.status}
                      size="small"
                      color={
                        task.status === 'In Progress' ? 'primary' :
                        task.status === 'Done' ? 'success' : 'default'
                      }
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Правая колонка - Статистика */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          {/* Текущий проект */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Активный проект
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#EDAB00' }}>TD</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="500">
                    УПП
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    3 задачи в работе
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Мои проекты */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Мои проекты
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {projects.map((project, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Typography variant="body2">{project.name}</Typography>
                    <Typography variant="body2" color="primary" fontWeight="500">
                      {project.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;