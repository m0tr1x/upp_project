// src/pages/Auth/Login.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Container,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Google, GitHub } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Вход:', formData);
    
    // После успешной авторизации:
    login({
      id: '1',
      firstName: 'Daria',
      lastName: 'Soldatova',
      email: formData.email
    });
    
    navigate('/');
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2
      }}
    >
      <Paper 
        elevation={16} 
        sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
        }}
      >
        {/* Заголовок - компактнее */}
        <Box textAlign="center" mb={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            <span style={{ color: '#EDAB00' }}>Task</span>
            <span style={{ color: 'black' }}>Tracker</span>
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ fontWeight: '500' }}
          >
            Вход в систему
          </Typography>
        </Box>

        {/* Форма входа */}
        <Card 
          component="form" 
          onSubmit={handleSubmit} 
          elevation={0}
          sx={{ background: 'transparent' }}
        >
          <CardContent sx={{ p: 0 }}>
            
            {/* Поле email */}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#EDAB00', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#EDAB00',
                  },
                }
              }}
            />

            {/* Поле пароля */}
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#EDAB00', fontSize: '20px' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ color: '#EDAB00', padding: '4px' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#EDAB00',
                  },
                }
              }}
            />

            {/* Запомнить меня и Забыли пароль */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    size="small"
                    sx={{ 
                      color: '#EDAB00',
                      '&.Mui-checked': {
                        color: '#EDAB00',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    Запомнить меня
                  </Typography>
                }
              />
              <Button 
                variant="text" 
                size="small"
                sx={{ 
                  color: '#EDAB00',
                  textTransform: 'none',
                  fontWeight: '500',
                  fontSize: '0.75rem'
                }}
              >
                Забыли пароль?
              </Button>
            </Box>

            {/* Кнопка входа */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={() => navigate('/Dashboard')}
              size="medium"
              sx={{
                py: 1,
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#EDAB00',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: '0 3px 10px 0 rgba(237, 171, 0, 0.3)',
                '&:hover': {
                  backgroundColor: '#d69b00',
                  boxShadow: '0 5px 15px rgba(237, 171, 0, 0.4)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Войти
            </Button>

            {/* Разделитель */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, fontSize: '0.75rem' }}>
                или войдите с помощью
              </Typography>
            </Divider>

            {/* Социальные кнопки */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google sx={{ fontSize: '18px' }} />}
                size="small"
                sx={{ 
                  py: 0.8,
                  borderRadius: 2,
                  borderColor: '#ddd',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#EDAB00',
                    backgroundColor: 'rgba(237, 171, 0, 0.04)'
                  }
                }}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHub sx={{ fontSize: '18px' }} />}
                size="small"
                sx={{ 
                  py: 0.8,
                  borderRadius: 2,
                  borderColor: '#ddd',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#EDAB00',
                    backgroundColor: 'rgba(237, 171, 0, 0.04)'
                  }
                }}
              >
                GitHub
              </Button>
            </Box>

            {/* Ссылка на регистрацию */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                У Вас нет аккаунта?{' '}
                <Button 
                  variant="text" 
                  size="small"
                  sx={{ 
                    color: '#EDAB00',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'rgba(237, 171, 0, 0.1)'
                    }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Зарегистрируйтесь
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default Login;