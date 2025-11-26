// src/pages/Auth/Register.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock, Badge } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
    console.log('Регистрация:', formData);
    
    // После успешной регистрации:
    login({
      id: '1',
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email
    });
    
    navigate('/');
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          maxWidth: 450,
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
        }}
      >
        {/* Заголовок */}
        <Box textAlign="center" mb={3}>
          <Typography 
            variant="h6" 
            color="black"
            sx={{ fontWeight: '700' }}
          >
            Регистрация
          </Typography>
        </Box>

        {/* Форма регистрации */}
        <Card 
          component="form" 
          onSubmit={handleSubmit} 
          elevation={0}
          sx={{ background: 'transparent' }}
        >
          <CardContent sx={{ p: 0 }}>
            
            
            
              {/* Поле имени */}
              <TextField
                fullWidth
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#000000ff', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#EDAB00',
                    },
                  }
                }}
              />

              {/* Поле фамилии */}
              <TextField
                fullWidth
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#000000ff', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#EDAB00',
                    },
                  }
                }}
              />
            

            {/* Поле username */}
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: '#000000ff', fontSize: '20px' }} />
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
                    <Email sx={{ color: '#000000ff', fontSize: '20px' }} />
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
                    <Lock sx={{ color: '#000000ff', fontSize: '20px' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ color: '#000000ff', padding: '4px' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
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

            {/* Поле подтверждения пароля */}
            <TextField
              fullWidth
              label="Повторите пароль"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#000000ff', fontSize: '20px' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                      sx={{ color: '#000000ff', padding: '4px' }}
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
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

            {/* Согласие с правилами */}
            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  sx={{
                    color: '#EDAB00',
                    '&.Mui-checked': {
                      color: '#EDAB00',
                    },
                  }}
                />
              }
              label="Я согласен со всеми правилами"
              sx={{ 
                mb: 3,
                '& .MuiTypography-root': {
                  fontSize: '0.875rem'
                }
              }}
            />

            {/* Кнопка регистрации */}
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
              Зарегистрироваться
            </Button>

            {/* Ссылка на вход */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                У вас уже есть аккаунт?{' '}
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
                  onClick={() => navigate('/login')}
                >
                  Войти
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default Register;