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
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock, Badge } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://213.176.18.15:8080';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Очищаем ошибки при изменении формы
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    // Проверка на пустые поля
    if (!formData.firstName.trim() || 
        !formData.lastName.trim() || 
        !formData.username.trim() || 
        !formData.email.trim() || 
        !formData.password.trim() || 
        !formData.confirmPassword.trim()) {
      setError('Все поля обязательны для заполнения');
      return false;
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email адрес');
      return false;
    }

    // Проверка пароля
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }

    // Проверка согласия с правилами
    if (!formData.agreeToTerms) {
      setError('Необходимо согласиться с правилами');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);
  console.log('API_URL переменная:', API_URL);
  console.log('process.env:', process.env);

  // Валидация формы
  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    // Подготовка данных для отправки
    const registrationData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password
    };

    console.log('Отправка на:', `${API_URL}/api/v1/auth/register`);
    console.log('Данные:', registrationData);

    const response = await axios.post(
      `${API_URL}/api/v1/auth/register`,
      registrationData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('Ответ сервера:', response);

    // Проверка успешного ответа
    if (response.status === 201 || response.status === 200) {
      const responseData = response.data;
      
      // ИСПРАВЛЕНИЕ: Получаем токен из ответа
      const tokenFromServer = responseData.token || responseData.accessToken;
      
      if (!tokenFromServer) {
        throw new Error('Токен не получен от сервера');
      }
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', tokenFromServer);
      
      // Проверяем структуру ответа
      console.log('Структура ответа:', responseData);
      
      // Логиним пользователя через контекст
      // Адаптируем под структуру ответа сервера
      const userData: any = {
        id: responseData.user?.id || responseData.id || Date.now().toString(),
        firstName: responseData.user?.firstName || responseData.firstName || formData.firstName,
        lastName: responseData.user?.lastName || responseData.lastName || formData.lastName,
        email: responseData.user?.email || responseData.email || formData.email,
      };

      // Добавляем username если он есть в ответе
      if (responseData.user?.username || responseData.username) {
        userData.username = responseData.user?.username || responseData.username || formData.username;
      }

      // ИСПРАВЛЕНИЕ: Передаем оба параметра в login
      login(userData, tokenFromServer);

      setSuccess('Регистрация прошла успешно! Вы будете перенаправлены...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } else {
      throw new Error(response.data?.message || 'Ошибка регистрации');
    }

  } catch (err: any) {
    console.error('Полная ошибка регистрации:', err);
    console.error('Данные ошибки:', err.response?.data);
    
    // Обработка различных типов ошибок
    if (err.response) {
      // Ошибка от сервера с кодом ответа
      const errorData = err.response.data;
      
      // Пытаемся извлечь сообщение об ошибке
      let errorMessage = 'Ошибка регистрации';
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors) {
        // Если есть массив ошибок
        errorMessage = Object.values(errorData.errors).join(', ');
      } else if (typeof errorData === 'object') {
        errorMessage = JSON.stringify(errorData);
      }
      
      setError(`Ошибка ${err.response.status}: ${errorMessage}`);
      
    } else if (err.request) {
      // Запрос был сделан, но ответ не получен
      setError('Не удалось подключиться к серверу. Проверьте интернет-соединение.');
    } else if (err.message?.includes('timeout')) {
      setError('Превышено время ожидания ответа от сервера');
    } else {
      // Другие ошибки
      setError(err.message || 'Произошла неизвестная ошибка при регистрации');
    }
  } finally {
    setLoading(false);
  }
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

        {/* Сообщения об ошибках/успехе */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {success}
          </Alert>
        )}

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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
                      disabled={loading}
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
              disabled={loading}
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
                      disabled={loading}
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
                  disabled={loading}
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
              size="medium"
              disabled={loading}
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
                '&.Mui-disabled': {
                  backgroundColor: '#f0c14b',
                  color: '#fff'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Зарегистрироваться'
              )}
            </Button>

            {/* Ссылка на вход */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                У вас уже есть аккаунт?{' '}
                <Button 
                  variant="text" 
                  size="small"
                  disabled={loading}
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