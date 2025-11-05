// src/pages/Auth/Register.tsx
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
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Google, GitHub } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const steps = ['Основная информация', 'Дополнительные данные', 'Подтверждение'];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    company: '',
    position: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Регистрация пользователя
    login({
      id: '1',
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email
    });
    
    navigate('/Dashboard'); // Редирект на Dashboard
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Имя и Фамилия */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#EDAB00' }} />
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
              <TextField
                fullWidth
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                variant="outlined"
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#EDAB00',
                    },
                  }
                }}
              />
            </Box>

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#EDAB00' }} />
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
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Пароль */}
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#EDAB00' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ color: '#EDAB00' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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

            {/* Подтверждение пароля */}
            <TextField
              fullWidth
              label="Подтвердите пароль"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#EDAB00' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                      sx={{ color: '#EDAB00' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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

            {/* Компания и должность */}
            <TextField
              fullWidth
              label="Компания (необязательно)"
              name="company"
              value={formData.company}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#EDAB00',
                  },
                }
              }}
            />
            <TextField
              fullWidth
              label="Должность (необязательно)"
              name="position"
              value={formData.position}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#EDAB00',
                  },
                }
              }}
            />
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="h6" color="text.primary" textAlign="center">
              Проверьте ваши данные
            </Typography>
            
            <Box sx={{ 
              p: 2, 
              border: '2px solid', 
              borderColor: '#EDAB00', 
              borderRadius: 2,
              backgroundColor: 'rgba(237, 171, 0, 0.05)'
            }}>
              <Typography variant="body2"><strong>Имя:</strong> {formData.firstName} {formData.lastName}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {formData.email}</Typography>
              {formData.company && <Typography variant="body2"><strong>Компания:</strong> {formData.company}</Typography>}
              {formData.position && <Typography variant="body2"><strong>Должность:</strong> {formData.position}</Typography>}
            </Box>

            <FormControlLabel
              control={
                <Checkbox 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
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
                  Я соглашаюсь с {' '}
                  <Button variant="text" sx={{ color: '#EDAB00', p: 0, minWidth: 'auto', fontSize: '0.875rem' }}>
                    условиями использования
                  </Button>
                  {' '} и {' '}
                  <Button variant="text" sx={{ color: '#EDAB00', p: 0, minWidth: 'auto', fontSize: '0.875rem' }}>
                    политикой конфиденциальности
                  </Button>
                </Typography>
              }
            />
          </Box>
        );
      
      default:
        return 'Неизвестный шаг';
    }
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
        py: 3
      }}
    >
      <Paper 
        elevation={24} 
        sx={{ 
          p: 4, 
          width: '100%',
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}
      >
        {/* Заголовок - уменьшили отступы */}
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
            Создание аккаунта
          </Typography>
        </Box>

        {/* Степпер - сделали компактнее */}
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 3,
            '& .MuiStepLabel-root': {
              padding: '4px'
            },
            '& .MuiStepLabel-label': {
              fontSize: '0.75rem',
              fontWeight: '500'
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Форма регистрации */}
        <Card 
          component="form" 
          onSubmit={handleSubmit} 
          elevation={0}
          sx={{ background: 'transparent' }}
        >
          <CardContent sx={{ p: 0 }}>
            
            {getStepContent(activeStep)}

            {/* Кнопки навигации */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  color: '#EDAB00',
                  fontWeight: '500',
                  textTransform: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Назад
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!formData.agreeToTerms}
                  sx={{
                    py: 1,
                    px: 3,
                    borderRadius: 2,
                    backgroundColor: '#EDAB00',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(237, 171, 0, 0.3)',
                    '&:hover': {
                      backgroundColor: '#d69b00',
                      boxShadow: '0 6px 20px rgba(237, 171, 0, 0.4)',
                    },
                    '&:disabled': {
                      backgroundColor: 'grey.300',
                      color: 'grey.500'
                    }
                  }}
                >
                  Завершить регистрацию
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    py: 1,
                    px: 3,
                    borderRadius: 2,
                    backgroundColor: '#EDAB00',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(237, 171, 0, 0.3)',
                    '&:hover': {
                      backgroundColor: '#d69b00',
                      boxShadow: '0 6px 20px rgba(237, 171, 0, 0.4)',
                    }
                  }}
                >
                  Далее
                </Button>
              )}
            </Box>

            {/* Разделитель для первого шага */}
            {activeStep === 0 && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2, fontSize: '0.75rem' }}>
                    или зарегистрируйтесь с помощью
                  </Typography>
                </Divider>

                {/* Социальные кнопки */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Google />}
                    sx={{ 
                      py: 1,
                      borderRadius: 2,
                      borderColor: '#ddd',
                      color: 'text.primary',
                      textTransform: 'none',
                      fontSize: '0.875rem',
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
                    startIcon={<GitHub />}
                    sx={{ 
                      py: 1,
                      borderRadius: 2,
                      borderColor: '#ddd',
                      color: 'text.primary',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        borderColor: '#EDAB00',
                        backgroundColor: 'rgba(237, 171, 0, 0.04)'
                      }
                    }}
                  >
                    GitHub
                  </Button>
                </Box>
              </>
            )}

            {/* Ссылка на вход */}
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Уже есть аккаунт?{' '}
                <Button 
                  variant="text" 
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
                  Войдите
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