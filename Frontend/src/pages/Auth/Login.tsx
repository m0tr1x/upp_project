// src/pages/Auth/Login.tsx
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
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://213.176.18.15:8080';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Все поля обязательны для заполнения');
      return false;
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email адрес');
      return false;
    }

    return true;
  };

  // Вспомогательная функция для поиска пользователя по email
const findUserByEmail = async (email: string, token: string): Promise<number | null> => {
  try {
    console.log(`🔍 Начинаем поиск пользователя по email: ${email}`);
    
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Пробуем найти пользователя, перебирая ID от 1 до 30
    for (let id = 1; id <= 30; id++) {
      try {
        console.log(`  Проверяем ID ${id}...`);
        
        const response = await api.get('/api/v1/user/get', {
          params: { id }
        });
        
        if (response.data && response.data.email === email) {
          console.log(`✅ Найден пользователь! ID: ${id}, Email: ${response.data.email}`);
          console.log('📋 Полные данные:', response.data);
          return id;
        }
      } catch (error: any) {
        // Если пользователь не найден (404) или другая ошибка, продолжаем поиск
        if (error.response?.status !== 404) {
          console.warn(`Ошибка при проверке ID ${id}:`, error.message);
        }
        continue;
      }
    }
    
    console.warn('⚠️ Пользователь не найден в диапазоне ID 1-30');
    return null;
    
  } catch (error) {
    console.error('❌ Ошибка при поиске пользователя:', error);
    return null;
  }
};

// Вспомогательная функция для получения данных пользователя по ID
const getUserById = async (userId: number, token: string): Promise<any | null> => {
  try {
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📥 Запрашиваем данные пользователя с ID ${userId}...`);
    
    const response = await api.get('/api/v1/user/get', {
      params: { id: userId }
    });
    
    if (response.data) {
      console.log(`✅ Получены данные пользователя ID ${userId}:`, response.data);
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Ошибка получения данных пользователя ${userId}:`, error);
    return null;
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  console.log('🚀 Начало процесса входа...');

  // Валидация формы
  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    // Подготовка данных для отправки
    const loginData = {
      email: formData.email.trim(),
      password: formData.password
    };

    console.log('📤 Отправка данных на сервер:', `${API_URL}/api/v1/auth/login`);
    console.log('📋 Данные для входа:', loginData);

    // 1. ШАГ: Отправляем запрос на логин
    const response = await axios.post(
      `${API_URL}/api/v1/auth/login`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('📥 Полный ответ от сервера:', response.data);

    // 2. ШАГ: Получаем токены из ответа
    const responseData = response.data;
    
    // Ищем токены в разных возможных местах ответа
    const accessToken = responseData.accessToken || responseData.token;
    const refreshToken = responseData.refreshToken;
    
    if (!accessToken) {
      throw new Error('Токен не получен от сервера');
    }
    
    console.log('🔑 Полученные токены:', {
      accessToken: accessToken.substring(0, 30) + '...',
      refreshToken: refreshToken ? refreshToken.substring(0, 30) + '...' : 'нет'
    });
    
    // 3. ШАГ: Проверяем, есть ли данные пользователя в ответе
    if (responseData.user) {
      // Если сервер вернул данные пользователя сразу
      console.log('✅ Данные пользователя в ответе:', responseData.user);
      
      // Подготавливаем данные пользователя
      const userData = {
        id: Number(responseData.user.id),
        email: responseData.user.email || formData.email,
        firstName: responseData.user.firstName || '',
        lastName: responseData.user.lastName || '',
        username: responseData.user.username || responseData.user.email?.split('@')[0] || 'user'
      };
      
      // Вызываем login в контексте
      login(userData, accessToken);
      
      // Перенаправляем на страницу проектов
      navigate('/projects');
      
    } else if (responseData.success) {
      // Если сервер вернул только success без данных пользователя
      console.log('⚠️ Сервер вернул успех, но без данных пользователя');
      console.log('🔄 Выполняем поиск пользователя по email...');
      
      // 4. ШАГ: Ищем пользователя по email
      const foundUserId = await findUserByEmail(formData.email.trim(), accessToken);
      
      if (foundUserId) {
        console.log(`✅ Найден ID пользователя: ${foundUserId}`);
        
        // Получаем полные данные пользователя по ID
        const fullUserData = await getUserById(foundUserId, accessToken);
        
        if (fullUserData) {
          console.log('✅ Получены данные пользователя:', fullUserData);
          
          // Подготавливаем данные для контекста
          const userData = {
            id: foundUserId,
            email: fullUserData.email || formData.email,
            firstName: fullUserData.firstName || '',
            lastName: fullUserData.lastName || '',
            username: fullUserData.email?.split('@')[0] || 'user'
          };
          
          // Вызываем login в контексте
          login(userData, accessToken);
          
          // Перенаправляем
          navigate('/projects');
        } else {
          throw new Error('Не удалось получить данные пользователя');
        }
      } else {
        // Если не нашли пользователя, создаем минимальный объект
        console.warn('⚠️ Пользователь не найден, создаем временные данные');
        
        const temporaryUserData = {
          id: 0, // Временный ID, будет исправлен позже
          email: formData.email,
          firstName: '',
          lastName: '',
          username: formData.email.split('@')[0]
        };
        
        login(temporaryUserData, accessToken);
        navigate('/projects');
      }
    } else {
      throw new Error('Неизвестный формат ответа от сервера');
    }
    
    // Сохраняем "запомнить меня"
    if (formData.rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
  } catch (err: any) {
    console.error('❌ Ошибка входа:', err);
    
    // Улучшенная обработка ошибок
    if (err.response) {
      console.error('📋 Детали ошибки:', {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers
      });
      
      if (err.response.status === 401) {
        setError('Неверный email или пароль');
      } else if (err.response.status === 404) {
        setError('Пользователь не найден');
      } else if (err.response.status === 400) {
        // Пробуем извлечь информацию из ошибки
        const errorText = typeof err.response.data === 'string' 
          ? err.response.data 
          : JSON.stringify(err.response.data);
        
        if (errorText.includes('password') || errorText.includes('Password')) {
          setError('Неверный пароль');
        } else if (errorText.includes('email') || errorText.includes('Email')) {
          setError('Пользователь с таким email не найден');
        } else {
          setError('Некорректные данные для входа');
        }
      } else if (err.response.status === 500) {
        setError('Внутренняя ошибка сервера. Попробуйте позже.');
      } else {
        setError(`Ошибка ${err.response.status}: ${err.response.data?.message || 'Неизвестная ошибка'}`);
      }
    } else if (err.request) {
      console.error('❌ Нет ответа от сервера:', err.request);
      setError('Не удалось подключиться к серверу. Проверьте интернет-соединение.');
    } else if (err.message?.includes('timeout')) {
      setError('Превышено время ожидания ответа от сервера');
    } else {
      setError(err.message || 'Произошла неизвестная ошибка при входе');
    }
  } finally {
    setLoading(false);
  }
};


  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Восстановление данных из localStorage при загрузке
  
React.useEffect(() => {
  const savedEmail = localStorage.getItem('rememberedEmail');
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  
  if (savedEmail && rememberMe) {
    setFormData(prev => ({
      ...prev,
      email: savedEmail,
      rememberMe: true
    }));
  }
  
  // Проверяем, есть ли токен в localStorage
  const token = localStorage.getItem('token');
  if (token) {
    console.log('🔑 Найден токен в localStorage, проверяем валидность...');
    // Можно добавить проверку токена здесь
  }
}, []);

  // Сохранение email при выборе "Запомнить меня"
  React.useEffect(() => {
    if (formData.rememberMe && formData.email) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else if (!formData.rememberMe) {
      localStorage.removeItem('rememberedEmail');
    }
  }, [formData.rememberMe, formData.email]);

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
        {/* Заголовок */}
        <Box textAlign="center" mb={3}>
          <Typography 
            variant="h6" 
            color="black"
            sx={{ fontWeight: '700' }}
          >
            Вход 
          </Typography>
        </Box>

        {/* Сообщения об ошибках */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

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

            {/* Запомнить меня и Забыли пароль */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Button 
                variant="text" 
                size="small"
                disabled={loading}
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
                'Войти'
              )}
            </Button>

            {/* Ссылка на регистрацию */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                У Вас нет аккаунта?{' '}
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