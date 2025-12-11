// src/pages/TaskPage.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete, Edit, CheckCircle, NavigateNext } from '@mui/icons-material';
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
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  name: string;
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

const TaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  const isFetchingRef = useRef(false);

  // Данные для формы редактирования
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 1,
    status: 0,
    projectId: 0,
    deadline: ''
  });

// В начале компонента, после useState:
useEffect(() => {
  // 🔥 ФИКС 8: Загружаем проекты из кеша сразу
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

  // Функция для поиска правильного endpoint'а удаления
const tryDeleteEndpoints = async (api: any, taskId: number): Promise<boolean> => {
  const endpoints = [
    { method: 'delete', url: '/api/v1/task/close', params: { id: taskId } },
    { method: 'delete', url: `/api/v1/task/${taskId}` },
    { method: 'delete', url: '/api/v1/task/delete', params: { id: taskId } },
    { method: 'post', url: `/api/v1/task/${taskId}/delete` },
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Пробуем endpoint: ${endpoint.method.toUpperCase()} ${endpoint.url}`);
      let response;
      
      if (endpoint.method === 'delete') {
        response = await api.delete(endpoint.url, { params: endpoint.params });
      } else {
        response = await api.post(endpoint.url, endpoint.params);
      }
      
      console.log(`✅ ${endpoint.url} сработал:`, response.data);
      return response.data === true || response.status === 200;
    } catch (error: any) {
      console.log(`❌ ${endpoint.url} не сработал:`, error.response?.status);
    }
  }
  
  return false;
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

  // Загрузка задачи с сервера
  const fetchTaskFromServer = async (): Promise<Task | null> => {
  if (!taskId || !token) return null;

  try {
    const api = getApiInstance();
    const numericId = parseInt(taskId);

    // Основной endpoint
    try {
      const response = await api.get(`/api/v1/task/get?id=${numericId}`);
      const taskData = response.data;
      
      if (taskData) {
        console.log('📥 Данные задачи с сервера:', taskData);
        
        // 🔥 ФИКС 1: Получаем информацию о проекте
        let projectName = 'Без проекта';
        let projectId: number | null = taskData.projectId ?? null;
        
        // Если есть ID проекта, пытаемся получить его название
        if (projectId) {
          try {
            // Запрашиваем информацию о проекте
            const projectResponse = await api.get(`/api/v1/project/get?id=${projectId}`);
            if (projectResponse.data?.name) {
              projectName = projectResponse.data.name;
            }
          } catch (projectError) {
            console.warn('⚠️ Не удалось получить информацию о проекте:', projectError);
            // Используем название из кеша проектов
            const cachedProject = projects.find(p => p.id === projectId);
            if (cachedProject) {
              projectName = cachedProject.name;
            }
          }
        }
        
        const formattedTask: Task = {
          id: taskData.id,
          title: taskData.title || 'Без названия',
          description: taskData.description || '',
          projectId: projectId,
          projectName: projectName, // ← Теперь с реальным названием
          status: taskData.status ?? 0,
          priority: taskData.priority ?? 1,
          deadline: taskData.deadline || taskData.dueDate,
          dueDate: taskData.dueDate || taskData.deadline,
          assigneeId: taskData.assigneeId || taskData.assignedId,
          assigneeName: taskData.assigneeName,
          createdAt: taskData.createdAt || new Date().toISOString(),
          updatedAt: taskData.updatedAt || new Date().toISOString()
        };

        console.log('✅ Сформированная задача:', formattedTask);
        return formattedTask;
      }
    } catch (serverError: any) {
      console.log('❌ Основной endpoint не сработал:', serverError.response?.status);
      throw serverError;
    }
  } catch (error: any) {
    console.error('❌ Ошибка загрузки с сервера:', error);
    
    if (error.response?.status === 401) {
      logout();
      navigate('/login');
    }
    throw error;
  }
  
  return null;
};

  
  // Загрузка задачи
const fetchTask = async () => {
  if (!taskId || !token) {
    setLoading(false);
    return;
  }

  if (isFetchingRef.current) {
    console.log('⚠️ Загрузка уже выполняется');
    return;
  }

  try {
    isFetchingRef.current = true;
    setLoading(true);
    
    // 🔥 ФИКС 2: Сначала загружаем проекты, чтобы знать их названия
    await fetchProjects();
    
    // 🔥 ФИКС 3: Теперь пробуем получить из localStorage с учетом проектов
    const cachedTasks = localStorage.getItem('user_tasks');
    if (cachedTasks) {
      try {
        const tasks: Task[] = JSON.parse(cachedTasks);
        const foundTask = tasks.find(t => t.id.toString() === taskId);
        if (foundTask) {
          console.log('✅ Найдена задача в кеше:', foundTask);
          
          // Обновляем название проекта, если оно есть в списке проектов
          let projectName = foundTask.projectName || 'Без проекта';
          if (foundTask.projectId && projects.length > 0) {
            const project = projects.find(p => p.id === foundTask.projectId);
            projectName = project ? project.name : projectName;
          }
          
          const updatedTask = {
            ...foundTask,
            projectName
          };
          
          setTask(updatedTask);
          setEditFormData({
            title: updatedTask.title,
            description: updatedTask.description || '',
            priority: updatedTask.priority,
            status: updatedTask.status,
            projectId: updatedTask.projectId || 0,
            deadline: formatDateForInput(updatedTask.deadline || updatedTask.dueDate)
          });
          setLoading(false);
        }
      } catch (e) {
        console.error('Ошибка чтения кеша:', e);
      }
    }

    // Загружаем с сервера (в фоне, если уже есть в кеше)
    const serverTask = await fetchTaskFromServer();
    if (serverTask) {
      console.log('✅ Задача загружена с сервера:', serverTask);
      setTask(serverTask);
      setEditFormData({
        title: serverTask.title,
        description: serverTask.description || '',
        priority: serverTask.priority,
        status: serverTask.status,
        projectId: serverTask.projectId || 0,
        deadline: formatDateForInput(serverTask.deadline || serverTask.dueDate)
      });

      // Обновляем localStorage
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        try {
          const tasks: Task[] = JSON.parse(cachedTasks);
          const existingIndex = tasks.findIndex(t => t.id === serverTask.id);
          
          if (existingIndex >= 0) {
            tasks[existingIndex] = serverTask;
          } else {
            tasks.push(serverTask);
          }
          
          localStorage.setItem('user_tasks', JSON.stringify(tasks));
          console.log('✅ Кеш обновлен с информацией о проекте');
        } catch (e) {
          console.error('Ошибка обновления кеша:', e);
        }
      }
    }
    
    setLoading(false);
  } catch (error) {
    console.error('❌ Ошибка загрузки задачи:', error);
    
    // Если задача не загружена с сервера и нет в кеше
    if (!task) {
      setSnackbarMessage('Не удалось загрузить задачу');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    
    setLoading(false);
  } finally {
    isFetchingRef.current = false;
  }
};

  // Загрузка проектов для выпадающего списка
  // Загрузка проектов для выпадающего списка
const fetchProjects = async () => {
  if (!token) return;

  try {
    const api = getApiInstance();
    console.log('📡 Загружаем проекты...');
    const response = await api.get('/api/v1/project/projects');
    
    if (response.data && Array.isArray(response.data)) {
      const formattedProjects: Project[] = response.data.map((project: any) => ({
        id: project.id || 0,
        name: project.name || 'Без названия'
      }));
      
      console.log('✅ Проекты загружены:', formattedProjects.length);
      setProjects(formattedProjects);
      
      // 🔥 ФИКС 4: Кешируем проекты в localStorage
      localStorage.setItem('user_projects', JSON.stringify(formattedProjects));
    }
  } catch (error: any) {
    console.error('Ошибка загрузки проектов:', error);
    
    // 🔥 ФИКС 5: Пробуем загрузить из кеша
    try {
      const cachedProjects = localStorage.getItem('user_projects');
      if (cachedProjects) {
        const projects = JSON.parse(cachedProjects);
        console.log('📂 Проекты загружены из кеша:', projects.length);
        setProjects(projects);
      }
    } catch (cacheError) {
      console.error('Ошибка загрузки проектов из кеша:', cacheError);
    }
  }
};

// 🔥 ФИКС 6: Эффект для обновления названия проекта при изменении списка проектов
useEffect(() => {
  if (task && projects.length > 0 && task.projectId) {
    const project = projects.find(p => p.id === task.projectId);
    if (project && project.name !== task.projectName) {
      console.log('🔄 Обновляем название проекта в задаче:', {
        old: task.projectName,
        new: project.name
      });
      
      const updatedTask = {
        ...task,
        projectName: project.name
      };
      
      setTask(updatedTask);
      
      // Обновляем кеш
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        try {
          const tasks: Task[] = JSON.parse(cachedTasks);
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
            localStorage.setItem('user_tasks', JSON.stringify(tasks));
          }
        } catch (e) {
          console.error('Ошибка обновления кеша:', e);
        }
      }
    }
  }
}, [projects, task]);

  // Основной useEffect
  useEffect(() => {
    console.log('🔄 useEffect запущен', {
      taskId,
      hasToken: !!token,
      loading,
      hasTask: !!task
    });

    if (!taskId) {
      console.log('⚠️ Нет taskId');
      setLoading(false);
      return;
    }

    if (!token) {
      console.log('🔑 Нет токена, редирект на логин');
      navigate('/login');
      return;
    }

    // Загружаем данные
    const loadData = async () => {
      try {
        await fetchTask();
        await fetchProjects();
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    loadData();

    // Cleanup функция
    return () => {
      console.log('🧹 Cleanup TaskPage');
      isFetchingRef.current = false;
    };
  }, [taskId, token]);

  

  // Удаление задачи
  // Удаление задачи
const handleDelete = async () => {
  if (!task) return;
  
  const confirmed = window.confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`);
  if (!confirmed) return;
  
  try {
    // СОЗДАЕМ api экземпляр перед использованием
    const api = getApiInstance();
    
    console.log('🗑️ Пробуем удалить задачу ID:', task.id);
    
    // Используем ту же логику, что и в Tasks.tsx
    const deleted = await tryDeleteEndpoints(api, task.id);
    
    if (deleted) {
      console.log('✅ Задача удалена на сервере');
      
      // Удаляем из localStorage
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        try {
          const tasksFromCache: Task[] = JSON.parse(cachedTasks);
          const updatedTasks = tasksFromCache.filter(t => t.id !== task.id);
          localStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
          console.log('✅ Задача удалена из кеша');
        } catch (e) {
          console.error('Ошибка обновления localStorage:', e);
        }
      }
      
      setSnackbarMessage('Задача успешно удалена с сервера');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Редирект через 1.5 секунды
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      throw new Error('Ни один endpoint не сработал');
    }
  } catch (error: any) {
    console.error('❌ Ошибка удаления задачи:', error);
    
    // Fallback: удаляем только из localStorage
    try {
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        const tasksFromCache: Task[] = JSON.parse(cachedTasks);
        const updatedTasks = tasksFromCache.filter(t => t.id !== task.id);
        localStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
        
        setSnackbarMessage('Задача удалена локально (ошибка сервера)');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (localError) {
      console.error('Ошибка удаления из localStorage:', localError);
      setSnackbarMessage('Ошибка удаления задачи');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }
};

  // Открытие диалога редактирования
  const handleEdit = () => {
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
    
    // 🔥 ФИКС 7: Получаем актуальное название проекта
    const selectedProject = projects.find(p => p.id === editFormData.projectId);
    const projectName = selectedProject ? selectedProject.name : 'Без проекта';
    
    // Формируем обновленный объект задачи
    const updatedTask: Task = {
      ...task,
      title: editFormData.title.trim(),
      description: editFormData.description?.trim() || '',
      status: editFormData.status,
      priority: editFormData.priority,
      projectId: editFormData.projectId > 0 ? editFormData.projectId : null,
      projectName: projectName, // ← Используем реальное название
      deadline: editFormData.deadline || '',
      dueDate: editFormData.deadline || '',
      updatedAt: new Date().toISOString()
    };
        
        // Обновляем состояние
        setTask(updatedTask);
        
        // Обновляем localStorage
        const cachedTasks = localStorage.getItem('user_tasks');
        if (cachedTasks) {
          try {
            const tasks: Task[] = JSON.parse(cachedTasks);
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            
            if (taskIndex !== -1) {
              tasks[taskIndex] = updatedTask;
              localStorage.setItem('user_tasks', JSON.stringify(tasks));
              console.log('✅ Кеш обновлен');
            }
          } catch (e) {
            console.error('Ошибка обновления кеша:', e);
          }
        }
        
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
      
      setTask(localUpdatedTask);
      
      // Обновляем localStorage
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        try {
          const tasks: Task[] = JSON.parse(cachedTasks);
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          
          if (taskIndex !== -1) {
            tasks[taskIndex] = localUpdatedTask;
            localStorage.setItem('user_tasks', JSON.stringify(tasks));
          }
        } catch (e) {
          console.error('Ошибка обновления localStorage:', e);
        }
      }
      
      setSnackbarMessage('Задача обновлена локально (ошибка сервера)');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      setIsEditDialogOpen(false);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    if (task) {
      setEditFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        projectId: task.projectId || 0,
        deadline: formatDateForInput(task.deadline || task.dueDate)
      });
    }
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
  const handleCompleteClick = () => {
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
        
        setTask(updatedTask);
        
        // Обновляем localStorage
        const cachedTasks = localStorage.getItem('user_tasks');
        if (cachedTasks) {
          const tasks: Task[] = JSON.parse(cachedTasks);
          const updatedTasks = tasks.map(t => 
            t.id === task.id ? updatedTask : t
          );
          localStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
        }
        
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
        setSnackbarMessage('Ошибка завершения задачи');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Отмена выполнения задачи
  const handleCancelCompletion = () => {
    setIsCompletionDialogOpen(false);
  };

  // Закрытие уведомления
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

  // Получение сообщения о выполнении
  const getCompletionMessage = () => {
    if (!task) return '';
    
    if (task.status === 2) {
      return `Задача была выполнена ${formatDate(task.updatedAt)}`;
    }
    return 'Вы уверены, что хотите отметить задачу как выполненную?';
  };

  // Отображение загрузки
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
          Загрузка задачи...
        </Typography>
        <Button 
          onClick={() => navigate('/dashboard')} 
          variant="outlined" 
          size="small"
        >
          Вернуться назад
        </Button>
      </Box>
    );
  }

  // Если задача не найдена
  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ cursor: 'pointer' }}
            >
              Дашборд
            </Link>
            <Typography color="text.primary">Задача не найдена</Typography>
          </Breadcrumbs>
        </Box>
        
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Задача не найдена
          </Alert>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Задача с ID {taskId} не существует или была удалена
          </Typography>
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="contained"
            sx={{ backgroundColor: '#EDAB00' }}
          >
            Вернуться на дашборд
          </Button>
        </Card>
      </Box>
    );
  }

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
        height: '600px',
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
                <strong>Проект:</strong> {task.projectName || 'Без проекта'}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                <strong>Приоритет:</strong> {PRIORITY_RU_MAP[task.priority] || 'Неизвестно'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Статус:</strong>
                </Typography>
                <Chip
                  label={STATUS_RU_MAP[task.status] || 'Неизвестно'}
                  size="small"
                  color={
                    task.status === 1 ? 'primary' :
                    task.status === 2 ? 'success' : 'default'
                  }
                  sx={{ ml: 1, fontSize: '0.65rem', height: '20px' }}
                />
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>
                <strong>Дедлайн:</strong> {formatDate(task.deadline || task.dueDate || '')}
              </Typography>

              {task.status === 2 && (
                <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem', color: 'success.main' }}>
                  <strong>Выполнено:</strong> {formatDate(task.updatedAt)}
                </Typography>
              )}
              
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                Создано: {formatDate(task.createdAt)}
              </Typography>
              
              {task.assigneeName && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}
                >
                  Исполнитель: {task.assigneeName}
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
              {task.description || 'Нет описания'}
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
              onClick={() => {
                const confirmed = window.confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`);
                if (confirmed) handleDelete();
              }}
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
                backgroundColor: task.status === 2 ? '#4caf50' : '#EDAB00',
                color: 'white',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.4,
                minHeight: '30px',
                '&:hover': {
                  backgroundColor: task.status === 2 ? '#45a049' : '#d69b00'
                }
              }}
            >
              {task.status === 2 ? 'Выполнено' : 'Задача выполнена'}
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
          {task.status !== 2 && (
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
          {task.status !== 2 && (
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

export default TaskPage;