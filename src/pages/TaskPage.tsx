// src/pages/TaskPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Breadcrumbs,
  Link,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete, Edit, CheckCircle, NavigateNext } from '@mui/icons-material';

const TaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock данные задачи
  const [task, setTask] = useState({
    id: taskId,
    title: 'Собрать волю в кулак',
    description: 'Необходимо преодолеть утреннюю лень и начать продуктивно работать над проектом. Важно распределить задачи по приоритетам и составить четкий план действий на день. Это поможет увеличить эффективность работы и снизить уровень стресса.\nКлючевые этапы:\n• Составить список приоритетных задач\n• Определить временные рамки для каждой задачи\n• Подготовить рабочее пространство\n• Начать с самой сложной задачи',
    project: 'Дом',
    status: 'In Progress',
    priority: 'Высокий',
    difficulty: 'Medium',
    createdDate: '25 октября 2025',
    deadline: '30 октября 2025',
    completedDate: ''
  });

  // Данные для формы редактирования
  const [editFormData, setEditFormData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    deadline: task.deadline
  });

  const handleDelete = () => {
    console.log('Удалить задачу:', task.id);
    // Логика удаления задачи
    navigate('/dashboard');
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline
    });
  };

  const handleSaveEdit = () => {
    setTask(prev => ({
      ...prev,
      ...editFormData
    }));
    setIsEditDialogOpen(false);
    setSnackbarMessage('Задача успешно обновлена!');
    setSnackbarOpen(true);
    console.log('Задача обновлена:', editFormData);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompleteClick = () => {
    if (task.status === 'Done') {
      setSnackbarMessage('Задача уже выполнена!');
      setSnackbarOpen(true);
      return;
    }
    setIsCompletionDialogOpen(true);
  };

  const handleConfirmCompletion = () => {
    const completionDate = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    setTask(prev => ({
      ...prev,
      status: 'Done',
      completedDate: completionDate
    }));

    setIsCompletionDialogOpen(false);
    setSnackbarMessage('Задача отмечена как выполненная!');
    setSnackbarOpen(true);
    
    console.log('Задача выполнена:', {
      taskId: task.id,
      completedAt: new Date().toISOString()
    });

    // Автоматический переход на дашборд через 2 секунды
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleCancelCompletion = () => {
    setIsCompletionDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getCompletionMessage = () => {
    if (task.status === 'Done') {
      return `Задача была выполнена ${task.completedDate}`;
    }
    return 'Вы уверены, что хотите отметить задачу как выполненную?';
  };

  return (
    <Box sx={{ 
      p: 3, 
      flex: 1,
      pt: 1
    }}>
      {/* Хлебные крошки */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 0 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/dashboard')}
          sx={{ 
            cursor: 'pointer',
            fontSize: '0.8rem',
            '&:hover': {
              color: '#EDAB00'
            }
          }}
        >
          Дашборд
        </Link>
        <Typography 
          color="text.primary" 
          sx={{ fontSize: '0.8rem' }}
        >
          Задача
        </Typography>
      </Breadcrumbs>

      <Card sx={{ 
        border: '1px solid grey',
        borderRadius: 5,
        height: '700px',
        width: '100%',
        position: 'relative',
        mt: 1
      }}>
        <CardContent sx={{ 
          p: 3,
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          
          {/* Кнопка назад в правом верхнем углу */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Button
              onClick={() => navigate('/dashboard')}
              sx={{
                textTransform: 'none',
                textDecoration: 'underline',
                color: 'text.primary',
                fontWeight: 'normal',
                fontSize: '0.7rem',
                '&:hover': {
                  textDecoration: 'underline',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Вернуться назад
            </Button>
          </Box>

          {/* Основной контент */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%'
          }}>
            
            {/* Заголовок задачи */}
            <Typography 
              variant="h6"
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                fontSize: '1.2rem'
              }}
            >
              {task.title}
            </Typography>

            {/* Блок с метаданными */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                <strong>Приоритет:</strong> {task.priority}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                <strong>Статус:</strong> 
                <Chip
                  label={task.status === 'In Progress' ? 'В процессе' : task.status === 'Done' ? 'Выполнено' : 'Не начато'}
                  size="small"
                  color={
                    task.status === 'In Progress' ? 'primary' :
                    task.status === 'Done' ? 'success' : 'default'
                  }
                  sx={{ ml: 1, fontSize: '0.65rem', height: '20px' }}
                />
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                <strong>Дедлайн:</strong> {task.deadline}
              </Typography>

              {task.completedDate && (
                <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem', color: 'success.main' }}>
                  <strong>Выполнено:</strong> {task.completedDate}
                </Typography>
              )}
              
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                Создано: {task.createdDate}
              </Typography>
            </Box>

            {/* Описание задачи */}
            <Typography 
              variant="body2"
              sx={{ 
                textAlign: 'left',
                color: 'text.primary',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
                m: 0,
                fontSize: '0.85rem'
              }}
            >
              {task.description}
            </Typography>

          </Box>

          {/* Кнопки действий в правом нижнем углу */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16,
            display: 'flex',
            gap: 1.5,
            alignItems: 'center'
          }}>
            {/* Кнопка удаления */}
            <Button
              onClick={handleDelete}
              sx={{
                color: '#EDAB00',
                minWidth: 'auto',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(237, 171, 0, 0.1)'
                }
              }}
            >
              <Delete sx={{ fontSize: '18px' }} />
            </Button>

            {/* Кнопка редактирования */}
            <Button
              onClick={handleEdit}
              sx={{
                color: '#EDAB00',
                minWidth: 'auto',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(237, 171, 0, 0.1)'
                }
              }}
            >
              <Edit sx={{ fontSize: '18px' }} />
            </Button>

            {/* Кнопка завершения задачи */}
            <Button
              onClick={handleCompleteClick}
              variant="contained"
              startIcon={<CheckCircle sx={{ fontSize: '18px' }} />}
              sx={{
                backgroundColor: task.status === 'Done' ? '#4caf50' : '#EDAB00',
                color: 'white',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.4,
                minHeight: '30px',
                '&:hover': {
                  backgroundColor: task.status === 'Done' ? '#45a049' : '#d69b00'
                }
              }}
            >
              {task.status === 'Done' ? 'Выполнено' : 'Задача выполнена'}
            </Button>
          </Box>

        </CardContent>
      </Card>

      {/* Диалог редактирования задачи */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Редактирование задачи
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название задачи"
              value={editFormData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Описание задачи"
              value={editFormData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={4}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={editFormData.priority}
                label="Приоритет"
                onChange={(e) => handleFormChange('priority', e.target.value)}
              >
                <MenuItem value="Низкий">Низкий</MenuItem>
                <MenuItem value="Средний">Средний</MenuItem>
                <MenuItem value="Высокий">Высокий</MenuItem>
                <MenuItem value="Критический">Критический</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={editFormData.status}
                label="Статус"
                onChange={(e) => handleFormChange('status', e.target.value)}
              >
                <MenuItem value="To Do">Не начато</MenuItem>
                <MenuItem value="In Progress">В процессе</MenuItem>
                <MenuItem value="Done">Выполнено</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Дедлайн"
              value={editFormData.deadline}
              onChange={(e) => handleFormChange('deadline', e.target.value)}
              fullWidth
              size="small"
              placeholder="ДД.ММ.ГГГГ"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelEdit}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            sx={{ 
              backgroundColor: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения выполнения */}
      <Dialog 
        open={isCompletionDialogOpen} 
        onClose={handleCancelCompletion}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Подтверждение выполнения
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            {getCompletionMessage()}
          </Typography>
          {task.status !== 'Done' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              После подтверждения задача будет перемещена в раздел "Выполнено"
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelCompletion}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          {task.status !== 'Done' && (
            <Button 
              onClick={handleConfirmCompletion}
              variant="contained"
              startIcon={<CheckCircle />}
              sx={{ 
                backgroundColor: '#4caf50',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#45a049'
                }
              }}
            >
              Подтвердить выполнение
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Уведомление */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskPage;