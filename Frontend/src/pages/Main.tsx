// src/pages/Main.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent
} from '@mui/material';
import { TrendingUp, Group, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Main: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#EDAB00' }} />,
      title: 'Управление задачами',
      description: 'Эффективно организуйте свои задачи и проекты'
    },
    {
      icon: <Group sx={{ fontSize: 40, color: '#EDAB00' }} />,
      title: 'Командная работа',
      description: 'Совместная работа над проектами с вашей командой'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#EDAB00' }} />,
      title: 'Безопасность',
      description: 'Ваши данные защищены и конфиденциальны'
    }
  ];

  return (
    <Box>
      {/* Герой секция */}
      <Box 
        sx={{ 
          color: 'white',
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            <span style={{ color: '#EDAB00' }}>Task</span><span style={{ color: '#000000ff' }}>Tracker</span>
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4, opacity: 0.9 }} style={{ color: '#000000ff' }}>
            Простой и эффективный способ управления вашими проектами
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 500, margin: '0 auto', fontSize: '1.1rem' }} style={{ color: '#000000ff' }}>
            Организуйте задачи, отслеживайте прогресс и работайте вместе с командой в одном месте
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            
          </Box>
        </Container>
      </Box>

      {/* Особенности - исправленная версия без Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
          Почему выбирают TaskTracker?
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          justifyContent: 'center'
        }}>
          {features.map((feature, index) => (
            <Box 
              key={index}
              sx={{ 
                flex: 1,
                minWidth: { xs: '100%', md: '300px' },
                maxWidth: { xs: '100%', md: '400px' }
              }}
            >
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: '600' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* CTA секция */}
      <Box 
        sx={{ 
          backgroundColor: '#f5f5f5',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Готовы начать?
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Присоединяйтесь к тысячам пользователей, которые уже управляют своими проектами с TaskTracker
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: '#EDAB00',
              color: 'white',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Зарегистрироваться бесплатно
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Main;