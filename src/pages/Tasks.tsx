// src/pages/Tasks.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { NavigateNext, Delete, Edit, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Типы данных
interface Task {
  id: number;
  title: string;
  description?: string;
  projectId?: number | null;
  projectName?: string;
  status: number;
  priority: number;
  deadline?: string;
  dueDate?: string;
  assigneeId?: number;
  assigneeName?: string;
  reporterId?: number;
  createdAt: string;
  updatedAt: string;
}

interface UpdateTaskRequest {
  id: number;
  title: string;
  description: string | null;
  status: number;
  priority: number;
  dueDate: string | null;
  projectId: number | null;
}

interface Project {
  id: number;
  name: string;
}

const API_BASE_URL = 'http://213.176.18.15:8080';

// Маппинг для статусов и приоритетов
const STATUS_RU_MAP: Record<number, string> = {
  0: 'Не начато',
  1: 'В процессе',
  2: 'Выполнено'
};

const PRIORITY_RU_MAP: Record<number, string> = {
  0: 'Низкий',
  1: 'Средний',
  2: 'Высокий'
};

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  
  // Состояния
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  
  // Состояния для UI
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  // Данные для формы редактирования
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 1,
    projectId: 0,
    status: 0,
    deadline: ''
  });

  const isFetchingRef = useRef(false);

  // В начале компонента, после useState:
useEffect(() => {
  // Загружаем проекты из кеша сразу
  try {
    const cachedProjects = localStorage.getItem('user_projects');
    if (cachedProjects) {
      const parsedProjects = JSON.parse(cachedProjects);
      if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
        console.log('📂 Проекты загружены из кеша при инициализации:', parsedProjects.length);
        setProjects(parsedProjects);
      }
    }
  } catch (e) {
    console.error('Ошибка загрузки проектов из кеша:', e);
  }
}, []);

  // Создаем axios instance
  const getApiInstance = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
    
  });
};

  // Функция для форматирования даты в input
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Ошибка форматирования даты:', e);
    }
    
    return '';
  };

  // Загрузка задач из localStorage
const loadTasksFromCache = () => {
  try {
    const cachedTasks = localStorage.getItem('user_tasks');
    if (cachedTasks) {
      const parsedTasks: Task[] = JSON.parse(cachedTasks);
      const validTasks = parsedTasks.filter((task: Task) => 
        task && task.id && task.id > 0
      );
      
      // 🔥 Обновляем названия проектов, если они есть в кеше проектов
      const projectsFromCache = localStorage.getItem('user_projects');
      if (projectsFromCache) {
        try {
          const projectsList: Project[] = JSON.parse(projectsFromCache);
          const enhancedTasks = validTasks.map(task => {
            if (task.projectId && projectsList.length > 0) {
              const project = projectsList.find(p => p.id === task.projectId);
              return {
                ...task,
                projectName: project ? project.name : task.projectName
              };
            }
            return task;
          });
          
          const sortedTasks = enhancedTasks.sort((a: Task, b: Task) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setTasks(sortedTasks);
          
          // Выбираем первую задачу если еще не выбрана
          if (sortedTasks.length > 0 && !selectedTask) {
            setSelectedTask(sortedTasks[0].id);
          }
          
          console.log('📂 Загружены задачи из кеша с названиями проектов:', sortedTasks.length);
          return sortedTasks.length > 0;
          
        } catch (error) {
          console.error('Ошибка обработки проектов:', error);
        }
      }
      
      // Если нет кеша проектов, просто сортируем
      const sortedTasks = validTasks.sort((a: Task, b: Task) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTasks(sortedTasks);
      
      if (sortedTasks.length > 0 && !selectedTask) {
        setSelectedTask(sortedTasks[0].id);
      }
      
      console.log('📂 Загружены задачи из кеша без проектов:', sortedTasks.length);
      return sortedTasks.length > 0;
    }
    return false;
  } catch (error) {
    console.error('Ошибка загрузки задач из кеша:', error);
    return false;
  }
};

 // Обновление задач в кеше
const updateTasksInCache = (newTasks: Task[]) => {
  try {
    // 🔥 Убедимся, что у всех задач есть названия проектов
    const enhancedTasks = newTasks.map(task => {
      if (task.projectId && projects.length > 0) {
        const project = projects.find(p => p.id === task.projectId);
        if (project && project.name !== task.projectName) {
          return {
            ...task,
            projectName: project.name
          };
        }
      }
      return task;
    });
    
    const sortedTasks = enhancedTasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    localStorage.setItem('user_tasks', JSON.stringify(sortedTasks));
    setTasks(sortedTasks);
    console.log('📝 Обновлен кеш задач с проектами:', sortedTasks.length);
  } catch (error) {
    console.error('Ошибка обновления кеша:', error);
  }
};

// Эффект для обновления названий проектов в задачах при изменении проектов
useEffect(() => {
  if (projects.length > 0 && tasks.length > 0) {
    updateProjectNamesInTasks(projects);
  }
}, [projects.length]); // Запускаем только при изменении количества проектов

// Функция для обновления названий проектов в задачах
const updateProjectNamesInTasks = (projectsList: Project[]) => {
  if (projectsList.length === 0) return;
  
  console.log('🔄 Обновляем названия проектов в задачах...');
  
  // Обновляем задачи в состоянии
  const updatedTasks = tasks.map(task => {
    if (task.projectId && projectsList.length > 0) {
      const project = projectsList.find(p => p.id === task.projectId);
      if (project && project.name !== task.projectName) {
        console.log(`  → Задача ${task.id}: "${task.projectName}" → "${project.name}"`);
        return {
          ...task,
          projectName: project.name
        };
      }
    }
    return task;
  });
  
  // Проверяем, есть ли изменения
  const hasChanges = updatedTasks.some((task, index) => 
    task.projectName !== tasks[index]?.projectName
  );
  
  if (hasChanges) {
    console.log('✅ Названия проектов обновлены');
    setTasks(updatedTasks);
    updateTasksInCache(updatedTasks);
  }
};

  // Загрузка проектов с сервера
const fetchProjects = async () => {
  if (!token) return;

  try {
    const api = getApiInstance();
    console.log('📡 Загружаем проекты с сервера...');
    const response = await api.get('/api/v1/project/projects');
    
    if (response.data && Array.isArray(response.data)) {
      const formattedProjects: Project[] = response.data.map((project: any) => ({
        id: project.id || 0,
        name: project.name || 'Без названия'
      }));
      
      console.log('✅ Проекты загружены с сервера:', formattedProjects.length);
      setProjects(formattedProjects);
      
      // 🔥 Кешируем проекты в localStorage
      localStorage.setItem('user_projects', JSON.stringify(formattedProjects));
      
      // 🔥 После загрузки проектов обновляем названия проектов в задачах
      updateProjectNamesInTasks(formattedProjects);
    }
  } catch (error) {
    console.error('Ошибка загрузки проектов с сервера:', error);
    
    // 🔥 Пробуем загрузить из кеша
    try {
      const cachedProjects = localStorage.getItem('user_projects');
      if (cachedProjects) {
        const parsedProjects = JSON.parse(cachedProjects);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          console.log('📂 Проекты загружены из кеша после ошибки:', parsedProjects.length);
          setProjects(parsedProjects);
        }
      }
    } catch (cacheError) {
      console.error('Ошибка загрузки проектов из кеша:', cacheError);
    }
  }
};

  // Функция для поиска правильного endpoint'а удаления
  const tryDeleteEndpoints = async (api: any, taskId: number): Promise<boolean> => {
  console.log(`🔍 Пробуем удалить задачу ${taskId}`);
  
  const attempts = [
    // 1. DELETE с query параметром БЕЗ withCredentials
    async () => {
      console.log('🔄 Пробуем: DELETE /api/v1/task/close?id=' + taskId);
      try {
        const response = await api.delete('/api/v1/task/close', {
          params: { id: taskId },
          withCredentials: false // ЯВНО отключаем credentials
        });
        console.log('✅ Успех (query param):', response.data);
        return response.data === true;
      } catch (error: any) {
        console.log('❌ Не сработал:', error.response?.status);
        return false;
      }
    },
    
    // 2. Попробуем использовать обычный fetch без axios
    async () => {
      console.log('🔄 Пробуем через fetch API');
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/task/close?id=${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors', // Явно указываем режим CORS
          credentials: 'omit' // Не отправляем credentials
        });
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ Успех через fetch:', data);
          return data === 'true' || response.status === 200;
        }
        return false;
      } catch (error) {
        console.log('❌ Fetch не сработал');
        return false;
      }
    }
  ];
  
  for (let i = 0; i < attempts.length; i++) {
    const result = await attempts[i]();
    if (result) {
      console.log(`🎉 Найден рабочий метод #${i + 1}`);
      return true;
    }
  }
  
  console.log('🚫 Все методы не сработали');
  return false;
};

const tryDeleteTask = async (taskId: number): Promise<boolean> => {
  try {
    const api = getApiInstance();
    
    console.log('🔍 Отправляем запрос DELETE /api/v1/task/close');
    console.log('📌 Параметры:', { id: taskId });
    console.log('🔑 Используемый токен (первые 20 символов):', token ? token.substring(0, 20) + '...' : 'Нет токена');
    
    // 1. Пробуем стандартный DELETE с query параметром
    console.log('\n🔄 1. DELETE с query параметром...');
    try {
      const response = await api.delete('/api/v1/task/close', {
        params: { id: taskId },
        validateStatus: (status) => status < 500 // Принимаем любые статусы < 500
      });
      
      console.log('📊 Ответ сервера:');
      console.log('   Статус:', response.status);
      console.log('   Данные:', response.data);
      console.log('   Заголовки:', response.headers);
      
      if (response.status === 200 && response.data === true) {
        console.log('✅ УСПЕХ! Задача удалена.');
        return true;
      }
      
      if (response.status === 401) {
        console.error('❌ ОШИБКА 401: Не авторизован');
        logout();
        navigate('/login');
        return false;
      }
      
      if (response.status === 403) {
        console.error('❌ ОШИБКА 403: Нет прав на удаление');
        return false;
      }
      
      if (response.status === 404) {
        console.error('❌ ОШИБКА 404: Задача не найдена');
        return false;
      }
      
    } catch (error1: any) {
      console.error('❌ Ошибка в первом запросе:', error1.message);
      if (error1.response) {
        console.error('   Статус:', error1.response.status);
        console.error('   Данные:', error1.response.data);
        console.error('   Заголовки:', error1.response.headers);
      }
    }
    
    // 2. Пробуем DELETE с телом запроса
    console.log('\n🔄 2. DELETE с телом запроса...');
    try {
      const response = await api.delete('/api/v1/task/close', {
        data: { id: taskId }, // ID в теле запроса
        validateStatus: (status) => status < 500
      });
      
      console.log('📊 Ответ сервера:');
      console.log('   Статус:', response.status);
      console.log('   Данные:', response.data);
      
      if (response.status === 200 && response.data === true) {
        console.log('✅ УСПЕХ! Задача удалена.');
        return true;
      }
    } catch (error2: any) {
      console.error('❌ Ошибка во втором запросе:', error2.message);
    }
    
    // 3. Проверяем, существует ли задача
    console.log('\n🔄 3. Проверяем существование задачи...');
    try {
      const checkResponse = await api.get('/api/v1/task/get', {
        params: { id: taskId }
      });
      
      console.log('📊 Задача существует:', checkResponse.data);
      console.log('   Данные задачи:', JSON.stringify(checkResponse.data, null, 2));
      
      // Проверяем, может у задачи есть специальный статус?
      if (checkResponse.data) {
        console.log('   Статус задачи:', checkResponse.data.status);
        console.log('   Reporter ID:', checkResponse.data.reporterId);
        console.log('   Assignee ID:', checkResponse.data.assigneeId);
        
        // Может у вас нет прав на удаление этой задачи?
        // Проверьте в консоли reporterId - это тот, кто создал задачу
      }
    } catch (checkError: any) {
      console.error('❌ Ошибка проверки задачи:', checkError.message);
    }
    
    // 4. Пробуем обновить статус на "выполнено" вместо удаления
    console.log('\n🔄 4. Пробуем обновить статус...');
    try {
      // Сначала получим текущие данные задачи
      const taskResponse = await api.get('/api/v1/task/get', {
        params: { id: taskId }
      });
      
      if (taskResponse.data) {
        const taskData = taskResponse.data;
        const updateData = {
          id: taskData.id,
          title: taskData.title,
          description: taskData.description,
          status: 2, // Выполнено
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          projectId: taskData.projectId
        };
        
        console.log('📤 Отправляем обновление:', updateData);
        
        const updateResponse = await api.put('/api/v1/task/update', updateData);
        
        console.log('📊 Ответ на обновление:');
        console.log('   Статус:', updateResponse.status);
        console.log('   Данные:', updateResponse.data);
        
        if (updateResponse.status === 200 && updateResponse.data === true) {
          console.log('✅ УСПЕХ! Статус обновлен.');
          return true;
        }
      }
    } catch (updateError: any) {
      console.error('❌ Ошибка обновления:', updateError.message);
    }
    
    return false;
    
  } catch (error: any) {
    console.error('💥 Критическая ошибка в tryDeleteTask:', error);
    return false;
  }
};

  // Удаление задачи
  const handleDelete = async () => {
  const task = getSelectedTaskData();
  if (!task) return;
  
  const confirmed = window.confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`);
  if (!confirmed) return;
  
  console.log('🚀 Начинаем процесс удаления задачи:', {
    id: task.id,
    title: task.title,
    reporterId: task.reporterId // добавьте это поле в интерфейс Task
  });
  
  // Временно отключаем удаление, чтобы посмотреть логи
  const deleted = await tryDeleteTask(task.id);
  
  if (deleted) {
    console.log('✅ Задача успешно удалена/закрыта на сервере');
    
    // Удаляем из localStorage
    const updatedTasks = tasks.filter(t => t.id !== task.id);
    updateTasksInCache(updatedTasks);
    
    // Выбираем следующую задачу
    if (updatedTasks.length > 0) {
      setSelectedTask(updatedTasks[0].id);
    } else {
      setSelectedTask(null);
    }
    
    setSnackbarMessage('Задача успешно удалена');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setIsDeleteDialogOpen(false);
  } else {
    console.log('⚠️ Удаление не удалось, но удалим локально');
    
    // Удаляем только из localStorage
    const updatedTasks = tasks.filter(t => t.id !== task.id);
    updateTasksInCache(updatedTasks);
    
    if (updatedTasks.length > 0) {
      setSelectedTask(updatedTasks[0].id);
    } else {
      setSelectedTask(null);
    }
    
    setSnackbarMessage('Задача удалена локально (ошибка сервера)');
    setSnackbarSeverity('warning');
    setSnackbarOpen(true);
    setIsDeleteDialogOpen(false);
  }
};

const getSortedTasks = () => {
  // Сначала сортируем по статусу: 0 (Не начато) -> 1 (В процессе) -> 2 (Выполнено)
  // А внутри каждого статуса - по дате создания (новые сверху)
  return [...tasks].sort((a, b) => {
    // Сначала сортируем по статусу
    if (a.status !== b.status) {
      return a.status - b.status; // 0, 1, 2 в порядке возрастания
    }
    // Если статусы одинаковые, сортируем по дате создания (новые сверху)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

  // Открытие диалога редактирования
  const handleEditClick = () => {
    const task = getSelectedTaskData();
    if (!task) return;
    
    setEditFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      projectId: task.projectId || 0,
      deadline: formatDateForInput(task.deadline || task.dueDate)
    });
    
    setIsEditDialogOpen(true);
  };

  // Сохранение редактирования
  const handleSaveEdit = async () => {
    const task = getSelectedTaskData();
    if (!task) return;
    
    // Проверка обязательных полей
    if (!editFormData.title.trim()) {
      setSnackbarMessage('Название задачи обязательно');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const api = getApiInstance();
      
      console.log('🔄 Обновляем задачу ID:', task.id);
      
      // Формируем данные согласно OpenAPI
      const updateData: UpdateTaskRequest = {
        id: task.id,
        title: editFormData.title.trim(),
        description: editFormData.description?.trim() || null,
        status: editFormData.status,
        priority: editFormData.priority,
        dueDate: editFormData.deadline ? 
          new Date(editFormData.deadline).toISOString().split('T')[0] : 
          null,
        projectId: editFormData.projectId > 0 ? editFormData.projectId : null
      };
      
      console.log('📤 Отправляем данные на обновление:', JSON.stringify(updateData, null, 2));
      
      // Пробуем разные endpoint'ы
      let response;
      try {
        // Основной endpoint
        response = await api.put('/api/v1/task/update', updateData);
        console.log('✅ Успех с основным endpoint:', response.data);
      } catch (error1: any) {
        console.log('❌ Основной endpoint не сработал:', error1.response?.status);
        
        try {
          // Альтернативный endpoint
          response = await api.put(`/api/v1/task/${task.id}`, updateData);
          console.log('✅ Успех с ID в URL:', response.data);
        } catch (error2: any) {
          console.log('❌ Все endpoint\'ы не сработали:', error2.response?.status);
          throw error2;
        }
      }
      
      if (response && response.data) {
        console.log('✅ Задача успешно обновлена на сервере');
        
        // Формируем обновленный объект задачи
        const updatedTask: Task = {
          ...task,
          title: editFormData.title.trim(),
          description: editFormData.description?.trim() || '',
          status: editFormData.status,
          priority: editFormData.priority,
          projectId: editFormData.projectId > 0 ? editFormData.projectId : null,
          projectName: projects.find(p => p.id === editFormData.projectId)?.name || 'Без проекта',
          deadline: editFormData.deadline || '',
          dueDate: editFormData.deadline || '',
          updatedAt: new Date().toISOString()
        };
        
        // Обновляем кеш
        const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
        updateTasksInCache(updatedTasks);
        
        // Закрываем диалог и показываем успех
        setIsEditDialogOpen(false);
        setSnackbarMessage('Задача успешно обновлена!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error('❌ Ошибка обновления задачи:', error);
      
      let errorMessage = 'Ошибка обновления задачи';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Некорректные данные. Проверьте заполнение полей.';
        } else if (error.response.status === 401) {
          logout();
          navigate('/login');
          return;
        } else if (error.response.status === 404) {
          errorMessage = 'Задача не найдена на сервере';
        }
      }
      
      // Fallback: обновляем только локально
      console.log('⚠️ Обновляем задачу только локально');
      const task = getSelectedTaskData();
      if (task) {
        const localUpdatedTask: Task = {
          ...task,
          title: editFormData.title.trim(),
          description: editFormData.description?.trim() || '',
          status: editFormData.status,
          priority: editFormData.priority,
          projectId: editFormData.projectId > 0 ? editFormData.projectId : null,
          projectName: projects.find(p => p.id === editFormData.projectId)?.name || 'Без проекта',
          deadline: editFormData.deadline || '',
          dueDate: editFormData.deadline || '',
          updatedAt: new Date().toISOString()
        };
        
        const updatedTasks = tasks.map(t => t.id === task.id ? localUpdatedTask : t);
        updateTasksInCache(updatedTasks);
      }
      
      setSnackbarMessage('Задача обновлена локально (ошибка сервера)');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      setIsEditDialogOpen(false);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
  };

  // Изменение данных в форме
  const handleFormChange = (field: keyof typeof editFormData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Нажатие на кнопку завершения задачи
  const handleCompleteTask = () => {
    const task = getSelectedTaskData();
    if (!task) return;
    
    if (task.status === 2) {
      setSnackbarMessage('Задача уже выполнена!');
      setSnackbarOpen(true);
      return;
    }
    setIsCompletionDialogOpen(true);
  };

  // Подтверждение выполнения задачи
  const handleConfirmCompletion = async () => {
    const task = getSelectedTaskData();
    if (!task) return;
    
    try {
      const api = getApiInstance();
      
      const updateData: UpdateTaskRequest = {
        id: task.id,
        title: task.title,
        description: task.description || null,
        status: 2,
        priority: task.priority,
        dueDate: task.deadline || task.dueDate || null,
        projectId: task.projectId || null
      };
      
      const response = await api.put('/api/v1/task/update', updateData);
      
      if (response.data) {
        // Обновляем локальное состояние
        const updatedTask: Task = {
          ...task,
          status: 2,
          updatedAt: new Date().toISOString()
        };
        
        const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
        updateTasksInCache(updatedTasks);
        
        setIsCompletionDialogOpen(false);
        setSnackbarMessage('Задача отмечена как выполненная!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error('Ошибка завершения задачи:', error);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        // Fallback: обновляем локально
        const task = getSelectedTaskData();
        if (task) {
          const updatedTask: Task = {
            ...task,
            status: 2,
            updatedAt: new Date().toISOString()
          };
          
          const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
          updateTasksInCache(updatedTasks);
          
          setIsCompletionDialogOpen(false);
          setSnackbarMessage('Задача отмечена как выполненная локально');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
        }
      }
    }
  };

  // Отмена выполнения задачи
  const handleCancelCompletion = () => {
    setIsCompletionDialogOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleTaskClick = (taskId: number) => {
    setSelectedTask(taskId);
  };

  const getSelectedTaskData = (): Task | null => {
    if (!selectedTask) return null;
    return tasks.find(task => task.id === selectedTask) || null;
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      return dateString;
    } catch {
      return 'Неизвестно';
    }
  };

  // Загрузка данных при монтировании
useEffect(() => {
  if (token) {
    console.log('Загружаем задачи...');
    loadTasksFromCache();
    fetchProjects();
    setLoading(false);
  } else {
    navigate('/login');
  }
}, [token]);

  // Отладочная информация
  useEffect(() => {
    console.log('Текущие задачи:', tasks.length);
    console.log('Выбранная задача:', selectedTask);
  }, [tasks, selectedTask]);

  // Если загрузка
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2 
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Загрузка задач...
        </Typography>
      </Box>
    );
  }

  const selectedTaskData = getSelectedTaskData();

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
                Мои задачи ({tasks.length})
              </Typography>

              {/* Список задач */}
{tasks.length === 0 ? (
  <Box sx={{ textAlign: 'center', p: 3 }}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Нет задач
    </Typography>
    <Button
      variant="outlined"
      onClick={() => navigate('/dashboard')}
      sx={{
        borderColor: '#EDAB00',
        color: '#EDAB00',
        '&:hover': {
          borderColor: '#d69b00',
          backgroundColor: 'rgba(237, 171, 0, 0.04)'
        }
      }}
    >
      Создать задачу
    </Button>
  </Box>
) : (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {getSortedTasks().map((task) => ( // Используем отсортированные задачи
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
              {task.description || 'Без описания'}
            </Typography>
          </Box>

          {/* Правая часть - статус */}
          <Chip
            label={STATUS_RU_MAP[task.status] || 'Неизвестно'}
            size="small"
            color={
              task.status === 1 ? 'primary' :
              task.status === 2 ? 'success' : 'default'
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
            Проект: {task.projectName || 'Без проекта'}
          </Typography>
          
          <Chip
            label={PRIORITY_RU_MAP[task.priority] || 'Неизвестно'}
            size="small"
            color={
              task.priority === 0 ? 'success' :
              task.priority === 1 ? 'warning' : 'error'
            }
          />
          
          <Typography variant="caption" color="text.secondary">
            Создано: {formatDate(task.createdAt)}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
)}
              
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
              
              {selectedTaskData ? (
                <>
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
                      {selectedTaskData.title}
                    </Typography>

                    {/* Блок с метаданными */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                        <strong>Проект:</strong> {selectedTaskData.projectName || 'Без проекта'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                        <strong>Приоритет:</strong> {PRIORITY_RU_MAP[selectedTaskData.priority] || 'Неизвестно'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          <strong>Статус:</strong>
                        </Typography>
                        <Chip
                          label={STATUS_RU_MAP[selectedTaskData.status] || 'Неизвестно'}
                          size="small"
                          color={
                            selectedTaskData.status === 1 ? 'primary' :
                            selectedTaskData.status === 2 ? 'success' : 'default'
                          }
                          sx={{ ml: 1, fontSize: '0.65rem', height: '20px' }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                        <strong>Дедлайн:</strong> {formatDate(selectedTaskData.deadline || selectedTaskData.dueDate || '')}
                      </Typography>

                      {selectedTaskData.status === 2 && (
                        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem', color: 'success.main' }}>
                          <strong>Выполнено:</strong> {formatDate(selectedTaskData.updatedAt)}
                        </Typography>
                      )}
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        Создано: {formatDate(selectedTaskData.createdAt)}
                      </Typography>
                      
                      {selectedTaskData.assigneeName && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}
                        >
                          Исполнитель: {selectedTaskData.assigneeName}
                        </Typography>
                      )}
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
                      {selectedTaskData.description || 'Нет описания'}
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
                      onClick={handleDeleteClick}
                      sx={{
                        color: '#ff4444',
                        minWidth: 'auto',
                        padding: '4px',
                        fontSize: '0.7rem',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 68, 68, 0.1)',
                          color: '#ff0000'
                        }
                      }}
                    >
                      <Delete sx={{ fontSize: '18px', mr: 0.5 }} />
                      Удалить
                    </Button>

                    {/* Кнопка редактирования */}
                    <Button
                      onClick={handleEditClick}
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
                      onClick={handleCompleteTask}
                      variant="contained"
                      startIcon={<CheckCircle sx={{ fontSize: '18px' }} />}
                      sx={{
                        backgroundColor: selectedTaskData.status === 2 ? '#4caf50' : '#EDAB00',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        px: 1.5,
                        py: 0.4,
                        minHeight: '30px',
                        '&:hover': {
                          backgroundColor: selectedTaskData.status === 2 ? '#45a049' : '#d69b00'
                        }
                      }}
                    >
                      {selectedTaskData.status === 2 ? 'Выполнено' : 'Задача выполнена'}
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  flexDirection: 'column',
                  gap: 2 
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Выберите задачу для просмотра
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      borderColor: '#EDAB00',
                      color: '#EDAB00',
                      '&:hover': {
                        borderColor: '#d69b00',
                        backgroundColor: 'rgba(237, 171, 0, 0.04)'
                      }
                    }}
                  >
                    Создать задачу
                  </Button>
                </Box>
              )}

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
              required
              error={!editFormData.title.trim()}
              helperText={!editFormData.title.trim() ? "Обязательное поле" : ""}
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
                value={editFormData.projectId || 0}
                label="Проект"
                onChange={(e) => handleFormChange('projectId', Number(e.target.value))}
              >
                <MenuItem value={0}>Без проекта</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={editFormData.priority}
                label="Приоритет"
                onChange={(e) => handleFormChange('priority', Number(e.target.value))}
              >
                <MenuItem value={0}>Низкий</MenuItem>
                <MenuItem value={1}>Средний</MenuItem>
                <MenuItem value={2}>Высокий</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={editFormData.status}
                label="Статус"
                onChange={(e) => handleFormChange('status', Number(e.target.value))}
              >
                <MenuItem value={0}>Не начато</MenuItem>
                <MenuItem value={1}>В процессе</MenuItem>
                <MenuItem value={2}>Выполнено</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Дедлайн"
              value={editFormData.deadline}
              onChange={(e) => handleFormChange('deadline', e.target.value)}
              fullWidth
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
              placeholder="YYYY-MM-DD"
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
            disabled={!editFormData.title.trim()}
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
            Вы уверены, что хотите удалить задачу "{selectedTaskData?.title}"?
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
            onClick={handleDelete}
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
            Вы уверены, что хотите отметить задачу как выполненную?
          </Typography>
          {selectedTaskData?.status !== 2 && (
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
          {selectedTaskData?.status !== 2 && (
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
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tasks;