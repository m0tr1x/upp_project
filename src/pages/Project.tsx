// src/pages/Project.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
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
import { Add, Edit, PersonAdd } from '@mui/icons-material';

const Project: React.FC = () => {
  // Состояния для управления
  const [projectName, setProjectName] = useState('Мой проект');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editProjectName, setEditProjectName] = useState('');

  // Данные для формы добавления задачи
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    project: 'Мой проект',
    difficulty: 'Medium',
    deadline: ''
  });

  // Mock данные для проекта
  const projectData = {
    createdDate: '25 октября 2025',
    deadline: '30 октября 2025',
    timeRemaining: '5 дней',
    description: 'Основной проект для управления текущими задачами и командой. Здесь отображаются все активные задачи, их статусы и прогресс выполнения.',
    totalTasks: 12,
    completedTasks: 8
  };

  // Данные для формы добавления участников
  const [newMemberData, setNewMemberData] = useState({
    login: '',
    role: 'Участник'
  });

  // Mock данные задач
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Собрать волю в кулак', 
      description: 'Найти мотивацию для начала рабочего дня',
      project: 'Мой проект', 
      status: 'In Progress', 
      difficulty: 'Medium',
      createdDate: '25.10.2025',
      deadline: '30.10.2025'
    },
    { 
      id: 2, 
      title: 'Поработать', 
      description: 'Выполнить основные задачи по проекту',
      project: 'Мой проект', 
      status: 'To Do', 
      difficulty: 'Hard',
      createdDate: '24.10.2025',
      deadline: '28.10.2025'
    },
    { 
      id: 3, 
      title: 'Проснуться', 
      description: 'Побороть утреннюю лень и встать с кровати',
      project: 'Мой проект', 
      status: 'In Progress', 
      difficulty: 'Easy',
      createdDate: '25.10.2025',
      deadline: '25.10.2025'
    },
  ]);

  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const completedTasks = tasks.filter(task => task.status === 'Done');

  // Обработчики для редактирования названия проекта
  const handleEditClick = () => {
    setEditProjectName(projectName);
    setIsEditDialogOpen(true);
  };

  const handleSaveProjectName = () => {
    if (!editProjectName.trim()) {
      setSnackbarMessage('Введите название проекта!');
      setSnackbarOpen(true);
      return;
    }

    setProjectName(editProjectName);
    setIsEditDialogOpen(false);
    setSnackbarMessage('Название проекта успешно изменено!');
    setSnackbarOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
  };

  // Обработчики для добавления участников
  const handleAddMembersClick = () => {
    setIsAddMembersDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!newMemberData.login.trim()) {
      setSnackbarMessage('Введите логин участника!');
      setSnackbarOpen(true);
      return;
    }

    setIsAddMembersDialogOpen(false);
    setSnackbarMessage(`Участник ${newMemberData.login} успешно добавлен!`);
    setSnackbarOpen(true);

    // Сброс формы
    setNewMemberData({
      login: '',
      role: 'Участник'
    });
  };

  const handleCancelAddMember = () => {
    setIsAddMembersDialogOpen(false);
    setNewMemberData({
      login: '',
      role: 'Участник'
    });
  };

  const handleMemberFormChange = (field: string, value: string) => {
    setNewMemberData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Обработчики для добавления задачи
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
      id: Math.max(...tasks.map(task => task.id)) + 1,
      title: newTaskData.title,
      description: newTaskData.description,
      project: projectName,
      status: 'To Do',
      difficulty: newTaskData.difficulty,
      createdDate: new Date().toLocaleDateString('ru-RU'),
      deadline: newTaskData.deadline || 'Не указан'
    };

    setTasks(prev => [newTask, ...prev]);
    setIsAddTaskDialogOpen(false);
    setSnackbarMessage('Задача успешно добавлена!');
    setSnackbarOpen(true);

    // Сброс формы
    setNewTaskData({
      title: '',
      description: '',
      project: projectName,
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
      project: projectName,
      difficulty: 'Medium',
      deadline: ''
    });
  };

  const handleTaskFormChange = (field: string, value: string) => {
    setNewTaskData(prev => ({
      ...prev,
      [field]: value
    }));
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
      {/* Заголовок страницы с кнопками */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        {/* Название проекта и кнопка редактирования */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {projectName}
          </Typography>
          <IconButton
            onClick={handleEditClick}
            sx={{
              color: '#EDAB00',
              '&:hover': {
                backgroundColor: 'rgba(237, 171, 0, 0.1)'
              }
            }}
          >
            <Edit />
          </IconButton>
        </Box>

        {/* Кнопка добавления участников */}
        <Button
          variant="outlined"
          startIcon={<PersonAdd />}
          onClick={handleAddMembersClick}
          sx={{
            borderColor: '#EDAB00',
            borderWidth: 2,
            backgroundColor: 'transparent',
            color: '#EDAB00',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 2,
            px: 2,
            py: 1,
            '&:hover': {
              borderColor: '#EDAB00',
              borderWidth: 2,
              backgroundColor: 'rgba(237, 171, 0, 0.1)'
            }
          }}
        >
          Добавить участников
        </Button>
      </Box>

      {/* Верхний ряд - 3 блока */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        
        {/* Первый блок - Информация о проекте */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 1
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 3 }}>
              Информация о проекте
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Дата создания */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Дата создания:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {projectData.createdDate}
                </Typography>
              </Box>

              {/* Дедлайн */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Дедлайн:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {projectData.deadline}
                </Typography>
              </Box>

              {/* Время до дедлайна */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Время:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {projectData.timeRemaining}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Второй блок - Описание проекта */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 2
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 2 }}>
              Описание проекта
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {projectData.description}
            </Typography>
          </CardContent>
        </Card>

        {/* Третий блок - Статистика задач */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 1
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 3 }}>
              Статистика
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Все задачи */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Все задачи:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {projectData.totalTasks}
                </Typography>
              </Box>

              {/* Выполненные */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Выполненные:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {projectData.completedTasks}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Нижний ряд - 3 блока */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        
        {/* Четвертый блок - Задачи на сегодня */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 1,
          height: 600
        }}>
          <CardContent>
            {/* Заголовок и кнопка в одной строке */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="h6" sx={{ color: '#EDAB00' }}>
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
                  fontSize: '0.8rem',
                  padding: '2px 6px',
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.5,
                    borderRadius: 3,
                    border: '1px solid grey',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  {/* Основное содержимое задачи */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Левая часть - название и описание */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                        {task.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
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
                      sx={{ ml: 1, fontSize: '0.6rem', height: '20px' }}
                    />
                  </Box>

                  {/* Нижняя часть - дата создания и дедлайн */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 1,
                    pt: 0.5,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Создано: {task.createdDate}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Дедлайн: {task.deadline}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Пятый блок - В процессе */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 1,
          height: 600
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 2 }}>
              В процессе
            </Typography>

            {/* Список задач в процессе */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {inProgressTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.5,
                    borderRadius: 3,
                    border: '1px solid grey',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                        {task.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {task.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={task.difficulty}
                      size="small"
                      color={
                        task.difficulty === 'Easy' ? 'success' :
                        task.difficulty === 'Medium' ? 'warning' :
                        'error'
                      }
                      sx={{ ml: 1, fontSize: '0.6rem', height: '20px' }}
                    />
                  </Box>
                  {/* Дата создания и дедлайн */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 1,
                    pt: 0.5,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Создано: {task.createdDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Дедлайн: {task.deadline}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Шестой блок - Выполненные */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 1,
          height: 600
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 2 }}>
              Выполненные
            </Typography>

            {/* Список выполненных задач */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {completedTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.5,
                    borderRadius: 3,
                    border: '1px solid grey',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                        {task.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {task.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={task.difficulty}
                      size="small"
                      color="success"
                      sx={{ ml: 1, fontSize: '0.6rem', height: '20px' }}
                    />
                  </Box>
                  {/* Дата создания и дедлайн */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 1,
                    pt: 0.5,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Создано: {task.createdDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Дедлайн: {task.deadline}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Диалог редактирования названия проекта */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Редактирование названия проекта
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Название проекта *"
              value={editProjectName}
              onChange={(e) => setEditProjectName(e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите название проекта"
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
            onClick={handleSaveProjectName}
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

      {/* Диалог добавления участников */}
      <Dialog 
        open={isAddMembersDialogOpen} 
        onClose={handleCancelAddMember}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Добавление участников
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Логин участника *"
              value={newMemberData.login}
              onChange={(e) => handleMemberFormChange('login', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите логин участника"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Роль</InputLabel>
              <Select
                value={newMemberData.role}
                label="Роль"
                onChange={(e) => handleMemberFormChange('role', e.target.value)}
              >
                <MenuItem value="Участник">Участник</MenuItem>
                <MenuItem value="Редактор">Редактор</MenuItem>
                <MenuItem value="Администратор">Администратор</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelAddMember}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSaveMember}
            variant="contained"
            sx={{ 
              backgroundColor: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

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
              onChange={(e) => handleTaskFormChange('title', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите название задачи"
            />

            {/* Поле описания */}
            <TextField
              label="Описание задачи"
              value={newTaskData.description}
              onChange={(e) => handleTaskFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="Опишите задачу подробнее"
            />

            {/* Поле проекта (фиксированное) */}
            <TextField
              label="Проект"
              value={projectName}
              fullWidth
              size="small"
              disabled
            />

            {/* Поле сложности */}
            <FormControl fullWidth size="small">
              <InputLabel>Сложность</InputLabel>
              <Select
                value={newTaskData.difficulty}
                label="Сложность"
                onChange={(e) => handleTaskFormChange('difficulty', e.target.value)}
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
              onChange={(e) => handleTaskFormChange('deadline', e.target.value)}
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

export default Project;