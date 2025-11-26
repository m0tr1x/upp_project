// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  Checkbox,
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
import { PlayArrow, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate(); 
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Данные для формы добавления задачи
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    project: 'Дом',
    priority: 'Средний',
    difficulty: 'Medium',
    deadline: ''
  });

  // Mock данные
  const [recentTasks, setRecentTasks] = useState([
    { 
      id: 1, 
      title: 'Собрать волю в кулак', 
      description: 'Найти мотивацию для начала рабочего дня',
      project: 'Дом', 
      status: 'In Progress', 
      difficulty: 'Medium',
      createdDate: '25.10.2025'
    },
    { 
      id: 2, 
      title: 'Поработать', 
      description: 'Выполнить основные задачи по проекту',
      project: 'Работа', 
      status: 'To Do', 
      difficulty: 'Hard',
      createdDate: '24.10.2025'
    },
    { 
      id: 3, 
      title: 'Проснуться', 
      description: 'Побороть утреннюю лень и встать с кровати',
      project: 'Дом', 
      status: 'In Progress', 
      difficulty: 'Easy',
      createdDate: '25.10.2025'
    },
  ]);

  const projects = [
    { name: 'УПП', progress: 75 },
    { name: 'TravelDays', progress: 45 },
    { name: 'TaskTracker', progress: 90 },
    { name: 'Internal Tools', progress: 30 },
  ];

  const handleAddTaskClick = () => {
    setIsAddTaskDialogOpen(true);
  };

  const handleSaveNewTask = () => {
    if (!newTaskData.title.trim()) {
      setSnackbarMessage('Введите название задачи!');
      setSnackbarOpen(true);
      return;
    }

    const newTask = {
      id: Math.max(...recentTasks.map(task => task.id)) + 1,
      title: newTaskData.title,
      description: newTaskData.description,
      project: newTaskData.project,
      status: 'To Do',
      difficulty: newTaskData.difficulty,
      createdDate: new Date().toLocaleDateString('ru-RU')
    };

    setRecentTasks(prev => [newTask, ...prev]);
    setIsAddTaskDialogOpen(false);
    setSnackbarMessage('Задача успешно добавлена!');
    setSnackbarOpen(true);

    // Сброс формы
    setNewTaskData({
      title: '',
      description: '',
      project: 'Дом',
      priority: 'Средний',
      difficulty: 'Medium',
      deadline: ''
    });

    console.log('Новая задача добавлена:', newTask);
  };

  const handleCancelAddTask = () => {
    setIsAddTaskDialogOpen(false);
    // Сброс формы при отмене
    setNewTaskData({
      title: '',
      description: '',
      project: 'Дом',
      priority: 'Средний',
      difficulty: 'Medium',
      deadline: ''
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setNewTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 0 }}>
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
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {getFormattedDate()}
          </Typography>
        </Box>
      </Box>

      {/* Сетка */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        
        {/* Первая колонка - Задачи на сегодня */}
        <Box sx={{ flex: 1.5 }}>
          <Card sx={{ 
            border: '1px solid grey',
            borderRadius: 5,
            height: '100%'
          }}>
            <CardContent>
              {/* Заголовок и кнопка в одной строке */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                color: '#EDAB00',
                mb: 2 
              }}>
                <Typography variant="h6">
                  Задачи на сегодня
                </Typography>
                <Button
                  variant="text"
                  startIcon={<Add sx={{ color: '#EDAB00' }} />}
                  onClick={handleAddTaskClick}
                  sx={{
                    color: 'black',
                    backgroundColor: 'transparent',
                    textTransform: 'none',
                    fontWeight: 'normal',
                    fontSize: '0.9rem',
                    padding: '4px 8px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#EDAB00',
                      '& .MuiSvgIcon-root': {
                        color: '#EDAB00'
                      }
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
                    onClick={() => navigate(`/task/${task.id}`)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      p: 2,
                      borderRadius: 5,
                      border: '1px solid grey',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: '#EDAB00'
                      }
                    }}
                  >
                    {/* Чекбокс в левом верхнем углу */}
                    <Checkbox
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        color: 'blue',
                        '&.Mui-checked': {
                          color: 'blue',
                        },
                        padding: 0.5
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Основное содержимое задачи */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', ml: 4 }}>
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
                      borderColor: 'divider',
                      ml: 4
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

        {/* Вторая колонка - Верхние блоки и Мои проекты */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 250 }}>
          
          {/* Верхние блоки в строку */}
          <Box sx={{ display: 'flex', gap: 3, height: 200 }}>
            
            {/* Статус выполнения */}
            <Card sx={{ 
              border: '1px solid grey',
              borderRadius: 5,
              flex: 1
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', fontSize: '0.9rem' }}>
                  Статус выполнения
                </Typography>
                
                {/* Круговые диаграммы */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Выполнено */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'conic-gradient(#4caf50 0% 75%, #e0e0e0 75% 100%)'
                          }}
                        />
                        <Typography
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontWeight: 'bold',
                            fontSize: '0.6rem'
                          }}
                        >
                          75%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight="500" sx={{ color: '#4caf50', fontSize: '0.8rem' }}>
                      Выполнено
                    </Typography>
                  </Box>

                  {/* В процессе */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'conic-gradient(#2196f3 0% 20%, #e0e0e0 20% 100%)'
                          }}
                        />
                        <Typography
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontWeight: 'bold',
                            fontSize: '0.6rem'
                          }}
                        >
                          20%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight="500" sx={{ color: '#2196f3', fontSize: '0.8rem' }}>
                      В процессе
                    </Typography>
                  </Box>

                  {/* Не начато */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'conic-gradient(#f44336 0% 5%, #e0e0e0 5% 100%)'
                          }}
                        />
                        <Typography
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontWeight: 'bold',
                            fontSize: '0.6rem'
                          }}
                        >
                          5%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight="500" sx={{ color: '#f44336', fontSize: '0.8rem' }}>
                      Не начато
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Заметки */}
            <Card sx={{ 
              border: '1px solid grey',
              borderRadius: 5,
              flex: 1
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', fontSize: '0.9rem' }}>
                  Заметки
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                  <TextField
                    multiline
                    rows={3}
                    placeholder="Добавьте заметки..."
                    variant="outlined"
                    size="small"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '0.8rem',
                        '&:hover fieldset': {
                          borderColor: '#EDAB00',
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#EDAB00',
                      color: 'white',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '0.7rem',
                      '&:hover': {
                        backgroundColor: '#d69b00'
                      }
                    }}
                  >
                    Сохранить
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Блок Мои проекты */}
          <Card sx={{ 
            border: '1px solid grey',
            borderRadius: 5
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#EDAB00', fontSize: '0.9rem' }}>
                  Мои проекты
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    minWidth: 'auto',
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#333'
                    }
                  }}
                >
                  Смотреть все
                </Button>
              </Box>

              {/* Список проектов */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {projects.map((project, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    {/* Название проекта */}
                    <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                      {project.name}
                    </Typography>
                    
                    {/* Тонкая шкала выполнения */}
                    <Box sx={{ 
                      width: 60, 
                      height: 4, 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: 2, 
                      overflow: 'hidden' 
                    }}>
                      <Box 
                        sx={{ 
                          height: '100%', 
                          backgroundColor: '#EDAB00',
                          width: `${project.progress}%`,
                          borderRadius: 2
                        }} 
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Диалог добавления задачи */}
      <Dialog 
        open={isAddTaskDialogOpen} 
        onClose={handleCancelAddTask}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Добавление новой задачи
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Поле названия */}
            <TextField
              label="Название задачи *"
              value={newTaskData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите название задачи"
            />

            {/* Поле описания */}
            <TextField
              label="Описание задачи"
              value={newTaskData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="Опишите задачу подробнее"
            />

            {/* Поле проекта */}
            <FormControl fullWidth size="small">
              <InputLabel>Проект</InputLabel>
              <Select
                value={newTaskData.project}
                label="Проект"
                onChange={(e) => handleFormChange('project', e.target.value)}
              >
                <MenuItem value="Дом">Дом</MenuItem>
                <MenuItem value="Работа">Работа</MenuItem>
                <MenuItem value="УПП">УПП</MenuItem>
                <MenuItem value="TravelDays">TravelDays</MenuItem>
              </Select>
            </FormControl>

            {/* Поле приоритета */}
            <FormControl fullWidth size="small">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={newTaskData.priority}
                label="Приоритет"
                onChange={(e) => handleFormChange('priority', e.target.value)}
              >
                <MenuItem value="Низкий">Низкий</MenuItem>
                <MenuItem value="Средний">Средний</MenuItem>
                <MenuItem value="Высокий">Высокий</MenuItem>
              </Select>
            </FormControl>

            {/* Поле сложности */}
            <FormControl fullWidth size="small">
              <InputLabel>Сложность</InputLabel>
              <Select
                value={newTaskData.difficulty}
                label="Сложность"
                onChange={(e) => handleFormChange('difficulty', e.target.value)}
              >
                <MenuItem value="Easy">Легкая</MenuItem>
                <MenuItem value="Medium">Средняя</MenuItem>
                <MenuItem value="Hard">Сложная</MenuItem>
              </Select>
            </FormControl>

            {/* Поле дедлайна */}
            <TextField
              label="Дедлайн"
              value={newTaskData.deadline}
              onChange={(e) => handleFormChange('deadline', e.target.value)}
              fullWidth
              size="small"
              placeholder="ДД.ММ.ГГГГ"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelAddTask}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSaveNewTask}
            variant="contained"
            sx={{ 
              backgroundColor: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Добавить задачу
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

export default Dashboard;