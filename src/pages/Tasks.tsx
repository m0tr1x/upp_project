// src/pages/Tasks.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Breadcrumbs,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { NavigateNext, Delete, Edit } from '@mui/icons-material';

const Tasks: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<number | null>(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock данные задач
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Собрать волю в кулак', 
      description: 'Найти мотивацию для начала рабочего дня',
      project: 'Дом', 
      status: 'In Progress', 
      difficulty: 'Medium',
      createdDate: '25 октября 2025',
      deadline: '30 октября 2025',
      priority: 'Высокий'
    },
    { 
      id: 2, 
      title: 'Поработать', 
      description: 'Выполнить основные задачи по проекту',
      project: 'Работа', 
      status: 'To Do', 
      difficulty: 'Hard',
      createdDate: '24 октября 2025',
      deadline: '28 октября 2025',
      priority: 'Средний'
    },
    { 
      id: 3, 
      title: 'Проснуться', 
      description: 'Побороть утреннюю лень и встать с кровати',
      project: 'Дом', 
      status: 'In Progress', 
      difficulty: 'Easy',
      createdDate: '25 октября 2025',
      deadline: '25 октября 2025',
      priority: 'Низкий'
    },
    { 
      id: 4, 
      title: 'Завершить проект', 
      description: 'Финальная стадия разработки проекта',
      project: 'УПП', 
      status: 'Done', 
      difficulty: 'Hard',
      createdDate: '20 октября 2025',
      deadline: '27 октября 2025',
      priority: 'Высокий'
    },
  ]);

  // Данные для формы редактирования
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    project: '',
    status: '',
    priority: '',
    difficulty: '',
    deadline: ''
  });

  const handleTaskClick = (taskId: number) => {
    setSelectedTask(taskId);
  };

  const getSelectedTaskData = () => {
    return tasks.find(task => task.id === selectedTask) || tasks[0];
  };

  const handleEditClick = () => {
    const task = getSelectedTaskData();
    setEditFormData({
      title: task.title,
      description: task.description,
      project: task.project,
      status: task.status,
      priority: task.priority,
      difficulty: task.difficulty,
      deadline: task.deadline
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData.title.trim()) {
      setSnackbarMessage('Введите название задачи!');
      setSnackbarOpen(true);
      return;
    }

    setTasks(prev => prev.map(task => 
      task.id === selectedTask 
        ? { ...task, ...editFormData }
        : task
    ));

    setIsEditDialogOpen(false);
    setSnackbarMessage('Задача успешно обновлена!');
    setSnackbarOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
  };

  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setTasks(prev => prev.filter(task => task.id !== selectedTask));
    
    // Выбираем следующую задачу или первую в списке
    const remainingTasks = tasks.filter(task => task.id !== selectedTask);
    if (remainingTasks.length > 0) {
      setSelectedTask(remainingTasks[0].id);
    } else {
      setSelectedTask(null);
    }

    setIsDeleteDialogOpen(false);
    setSnackbarMessage('Задача успешно удалена!');
    setSnackbarOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleCompleteTask = () => {
    setTasks(prev => prev.map(task => 
      task.id === selectedTask 
        ? { ...task, status: 'Done' }
        : task
    ));
    setSnackbarMessage('Задача отмечена как выполненная!');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => window.location.href = '/dashboard'}
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
          Мои задачи
        </Typography>
      </Breadcrumbs>

      {/* Две колонки */}
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 150px)' }}>
        
        {/* Левая колонка - Список задач */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ 
            border: '1px solid grey',
            borderRadius: 5,
            height: '100%',
            overflow: 'auto'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 3 }}>
                Мои задачи
              </Typography>

              {/* Список задач */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tasks.map((task) => (
                  <Box
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      p: 2,
                      borderRadius: 5,
                      border: '1px solid grey',
                      cursor: 'pointer',
                      backgroundColor: selectedTask === task.id ? 'action.hover' : 'transparent',
                      borderColor: selectedTask === task.id ? '#EDAB00' : 'grey',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: '#EDAB00'
                      }
                    }}
                  >
                    {/* Основное содержимое задачи */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {/* Левая часть - название и описание */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 0.5 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {task.description}
                        </Typography>
                      </Box>

                      {/* Правая часть - сложность */}
                      <Chip
                        label={task.difficulty}
                        size="small"
                        color={
                          task.difficulty === 'Easy' ? 'success' :
                          task.difficulty === 'Medium' ? 'warning' :
                          'error'
                        }
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    {/* Нижняя часть - метаданные */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 1.5,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        Проект: {task.project}
                      </Typography>
                      
                      <Chip
                        label={
                          task.status === 'In Progress' ? 'В процессе' :
                          task.status === 'Done' ? 'Выполнено' : 'Не начато'
                        }
                        size="small"
                        color={
                          task.status === 'In Progress' ? 'primary' :
                          task.status === 'Done' ? 'success' : 'default'
                        }
                      />
                      
                      <Typography variant="caption" color="text.secondary">
                        Создано: {task.createdDate}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Правая колонка - Детали задачи */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ 
            border: '1px solid grey',
            borderRadius: 5,
            height: '100%',
            position: 'relative'
          }}>
            <CardContent sx={{ 
              p: 3,
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}>
              
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
                  {getSelectedTaskData().title}
                </Typography>

                {/* Блок с метаданными */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                    <strong>Приоритет:</strong> {getSelectedTaskData().priority}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                    <strong>Статус:</strong> 
                    <Chip
                      label={
                        getSelectedTaskData().status === 'In Progress' ? 'В процессе' :
                        getSelectedTaskData().status === 'Done' ? 'Выполнено' : 'Не начато'
                      }
                      size="small"
                      color={
                        getSelectedTaskData().status === 'In Progress' ? 'primary' :
                        getSelectedTaskData().status === 'Done' ? 'success' : 'default'
                      }
                      sx={{ ml: 1, fontSize: '0.65rem', height: '20px' }}
                    />
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                    <strong>Дедлайн:</strong> {getSelectedTaskData().deadline}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Создано: {getSelectedTaskData().createdDate}
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
                  {getSelectedTaskData().description}
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
                <IconButton
                  onClick={handleDeleteClick}
                  sx={{
                    color: '#EDAB00',
                    '&:hover': {
                      backgroundColor: 'rgba(237, 171, 0, 0.1)'
                    }
                  }}
                >
                  <Delete />
                </IconButton>

                {/* Кнопка редактирования */}
                <Button
                  onClick={handleEditClick}
                  variant="contained"
                  startIcon={<Edit />}
                  sx={{
                    backgroundColor: '#EDAB00',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.4,
                    minHeight: '30px',
                    '&:hover': {
                      backgroundColor: '#d69b00'
                    }
                  }}
                >
                  Редактировать
                </Button>

                {/* Кнопка завершения задачи */}
                <Button
                  onClick={handleCompleteTask}
                  variant="contained"
                  sx={{
                    backgroundColor: getSelectedTaskData().status === 'Done' ? '#4caf50' : '#EDAB00',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.4,
                    minHeight: '30px',
                    '&:hover': {
                      backgroundColor: getSelectedTaskData().status === 'Done' ? '#45a049' : '#d69b00'
                    }
                  }}
                >
                  {getSelectedTaskData().status === 'Done' ? 'Выполнено' : 'Завершить'}
                </Button>
              </Box>

            </CardContent>
          </Card>
        </Box>
      </Box>

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
              label="Название задачи *"
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
              <InputLabel>Проект</InputLabel>
              <Select
                value={editFormData.project}
                label="Проект"
                onChange={(e) => handleFormChange('project', e.target.value)}
              >
                <MenuItem value="Дом">Дом</MenuItem>
                <MenuItem value="Работа">Работа</MenuItem>
                <MenuItem value="УПП">УПП</MenuItem>
                <MenuItem value="TravelDays">TravelDays</MenuItem>
              </Select>
            </FormControl>
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
            <FormControl fullWidth size="small">
              <InputLabel>Сложность</InputLabel>
              <Select
                value={editFormData.difficulty}
                label="Сложность"
                onChange={(e) => handleFormChange('difficulty', e.target.value)}
              >
                <MenuItem value="Easy">Легкая</MenuItem>
                <MenuItem value="Medium">Средняя</MenuItem>
                <MenuItem value="Hard">Сложная</MenuItem>
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

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Вы уверены, что хотите удалить задачу "{getSelectedTaskData().title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelDelete}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ 
              textTransform: 'none',
            }}
          >
            Удалить
          </Button>
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

export default Tasks;