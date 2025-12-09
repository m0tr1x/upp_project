// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
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
  Alert,
  CircularProgress
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Типы данных
interface Task {
  id: number;
  title: string;
  description?: string;
  projectId?: number;
  projectName?: string;
  status: number;
  priority: number;
  deadline?: string;
  assigneeId?: number;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId?: number;
  priority: number;
  status?: number;
  deadline?: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  status: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
  teamId?: number;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: number;
  teamId: number;
}

const API_BASE_URL = 'http://213.176.18.15:8080';

// Константы для маппинга
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

const Dashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Состояния
  const [isFetching, setIsFetching] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState({
  tasks: false,
  projects: true,
  teams: false
});
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для UI
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  // Данные для форм
  const [newTaskData, setNewTaskData] = useState<CreateTaskRequest>({
  title: '',
  description: '',
  projectId: undefined,
  priority: 1, // ← Средний по умолчанию (1, а не 0)
  status: 0,
  deadline: ''
});

  const [newProjectData, setNewProjectData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    status: 0, // Active по умолчанию
    teamId: 0 // Будет установлен при загрузке
  });

  // Функции для приветствия и даты
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  };

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

// Загружаем проекты из кеша сразу при инициализации
useEffect(() => {
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
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    instance.interceptors.request.use(
      config => {
        console.log('🔧 Отправка запроса:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data
        });
        return config;
      },
      error => {
        console.error('❌ Ошибка в перехватчике запроса:', error);
        return Promise.reject(error);
      }
    );

    return instance;
  };

  // Вспомогательная функция для получения названия проекта по ID
const getProjectNameById = (projectId: number): string => {
  if (!projectId) return 'Без проекта';
  
  // Сначала ищем в текущем состоянии
  const project = projects.find(p => p.id === projectId);
  if (project) return project.name;
  
  // Пробуем найти в кеше
  try {
    const cachedProjects = localStorage.getItem('user_projects');
    if (cachedProjects) {
      const projectsList: Project[] = JSON.parse(cachedProjects);
      const cachedProject = projectsList.find(p => p.id === projectId);
      if (cachedProject) return cachedProject.name;
    }
  } catch (e) {
    console.error('Ошибка поиска проекта в кеше:', e);
  }
  
  return `Проект #${projectId}`;
};

  // Загрузка задач ТОЛЬКО ИЗ КЕША
const loadUserTasks = async () => {
  try {
    setLoading(prev => ({ ...prev, tasks: true }));
    
    const api = getApiInstance();
    
    console.log('📡 Запрос задач с сервера...');
    const response = await api.get('/api/v1/task/get/teammate');
    
    console.log('📥 СЫРЫЕ данные с сервера (teammateTasks):', response.data?.teammateTasks);
    
    if (response.data?.teammateTasks && Array.isArray(response.data.teammateTasks)) {
      const tasksData = response.data.teammateTasks;
      
      // 🔥 Загружаем проекты из кеша для корректных названий
      let availableProjects = projects;
      if (availableProjects.length === 0) {
        try {
          const cachedProjects = localStorage.getItem('user_projects');
          if (cachedProjects) {
            const parsedProjects = JSON.parse(cachedProjects);
            availableProjects = parsedProjects.filter((p: Project) => p.status === 0);
            console.log('📂 Проекты загружены из кеша для задач:', availableProjects.length);
          }
        } catch (e) {
          console.error('Ошибка загрузки проектов из кеша:', e);
        }
      }
      
      const transformedTasks: Task[] = tasksData.map((task: any) => {
        const priorityValue = task.priority !== undefined && task.priority !== null 
          ? Number(task.priority) 
          : 1;
        
        let projectName = `Проект #${task.projectId}`;
        
        // 🔥 ПРОВЕРЯЕМ: если есть проекты, ищем название
        if (availableProjects && availableProjects.length > 0) {
          const project = availableProjects.find(p => p.id === task.projectId);
          projectName = project ? project.name : projectName;
        }
        
        return {
          id: task.id,
          title: task.title || 'Без названия',
          description: task.description,
          projectId: task.projectId,
          projectName: projectName,
          status: task.status !== undefined ? Number(task.status) : 0,
          priority: priorityValue,
          deadline: task.dueDate,
          assigneeId: task.assigneeId,
          assigneeName: user?.firstName,
          createdAt: task.createdAt || new Date().toISOString(),
          updatedAt: task.updatedAt
        };
      });
      
      // Сохраняем в localStorage
      localStorage.setItem('user_tasks', JSON.stringify(transformedTasks));
      
      setTasks(transformedTasks);
      console.log('📊 Всего задач загружено:', transformedTasks.length);
      
    } else {
      console.warn('⚠️ Нет задач в ответе сервера');
      setTasks([]);
    }
  } catch (error: any) {
    console.error('❌ Ошибка загрузки задач с сервера:', error);
    
    // При ошибке загружаем из кеша
    try {
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        const parsedTasks = JSON.parse(cachedTasks);
        console.log('📂 Загружены задачи из кеша:', parsedTasks.length);
        setTasks(parsedTasks);
      } else {
        setTasks([]);
      }
    } catch (cacheError) {
      console.error('Ошибка загрузки из кеша:', cacheError);
      setTasks([]);
    }
    
    if (error.response?.status === 401) {
      logout();
      navigate('/login');
    }
  } finally {
    setLoading(prev => ({ ...prev, tasks: false }));
  }
};


  // Обновление задач в кеше ПОСЛЕ успешного запроса на сервере
  const updateTasksInCache = (newTasks: Task[]) => {
    try {
      // Сортируем по дате создания (новые сверху)
      const sortedTasks = newTasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localStorage.setItem('user_tasks', JSON.stringify(sortedTasks));
      setTasks(sortedTasks);
      console.log('📝 Обновлен кеш задач:', sortedTasks.length);
    } catch (error) {
      console.error('Ошибка обновления кеша:', error);
    }
  };

// Получаем задачи, отсортированные по статусу
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

// Функция для обновления названий проектов в задачах
const updateProjectNamesInTasks = () => {
  if (projects.length === 0 || tasks.length === 0) return;
  
  console.log('🔄 Проверяем названия проектов в задачах...');
  
  const updatedTasks = tasks.map(task => {
    if (task.projectId && projects.length > 0) {
      const project = projects.find(p => p.id === task.projectId);
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
    console.log('✅ Названия проектов обновлены в задачах');
    setTasks(updatedTasks);
    localStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
  }
};

  // Загрузка команд пользователя
  const fetchUserTeams = async () => {
    try {
      setLoading(prev => ({ ...prev, teams: true }));
      
      const api = getApiInstance();
      const response = await api.get('/api/v1/team/teams');
      
      if (response.data && Array.isArray(response.data)) {
        setTeams(response.data);
        
        // Устанавливаем первую команду как выбранную по умолчанию
        if (response.data.length > 0 && newProjectData.teamId === 0) {
          setNewProjectData(prev => ({
            ...prev,
            teamId: response.data[0].id
          }));
        }
      }
    } catch (error: any) {
      console.error('Ошибка загрузки команд:', error);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  };

  // Загрузка проектов с сервера
const fetchUserProjects = async () => {
  try {
    setLoading(prev => ({ ...prev, projects: true }));
    
    const api = getApiInstance();
    const response = await api.get('/api/v1/project/projects');
    
    if (response.data) {
      let projectsData = response.data;
      
      if (response.data.projects && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      } else if (!Array.isArray(response.data)) {
        projectsData = [response.data];
      }
      
      const allProjects: Project[] = projectsData.map((project: any) => ({
        id: project.id || 0,
        name: project.name || 'Без названия',
        description: project.description,
        status: project.status || 0,
        progress: project.progress || 0,
        teamId: project.teamId,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString()
      }));
      
      // 🔥 Кешируем ВСЕ проекты (не только активные)
      localStorage.setItem('user_projects', JSON.stringify(allProjects));
      console.log('📝 Все проекты сохранены в кеш:', allProjects.length);
      
      // 🔥 ФИЛЬТРУЕМ: показываем только активные проекты (status=0)
      const activeProjects = allProjects.filter(project => project.status === 0);
      
      setProjects(activeProjects);
      
      if (activeProjects.length > 0 && !newTaskData.projectId) {
        setNewTaskData(prev => ({
          ...prev,
          projectId: activeProjects[0].id
        }));
      }
      
      console.log(`📊 Проекты: Всего ${allProjects.length}, Активных ${activeProjects.length}`);
    }
  } catch (error: any) {
    console.error('Ошибка загрузки проектов:', error);
    
    // 🔥 При ошибке загружаем из кеша
    try {
      const cachedProjects = localStorage.getItem('user_projects');
      if (cachedProjects) {
        const parsedProjects = JSON.parse(cachedProjects);
        const activeProjects = parsedProjects.filter((project: Project) => project.status === 0);
        
        console.log('📂 Проекты загружены из кеша после ошибки:', activeProjects.length);
        setProjects(activeProjects);
        
        if (activeProjects.length > 0 && !newTaskData.projectId) {
          setNewTaskData(prev => ({
            ...prev,
            projectId: activeProjects[0].id
          }));
        }
      }
    } catch (cacheError) {
      console.error('Ошибка загрузки проектов из кеша:', cacheError);
    }
    
    if (error.response?.status === 401) {
      logout();
      navigate('/login');
    }
  } finally {
    setLoading(prev => ({ ...prev, projects: false }));
  }
};
    

  // Создание нового проекта
  const handleSaveNewProject = async () => {
    if (!newProjectData.name.trim()) {
      setSnackbarMessage('Введите название проекта!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!newProjectData.teamId || newProjectData.teamId <= 0) {
      setSnackbarMessage('Выберите команду!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const api = getApiInstance();
      
      // Формируем данные для создания проекта согласно спецификации
      const projectData: CreateProjectRequest = {
        name: newProjectData.name.trim(),
        description: newProjectData.description?.trim() || undefined,
        status: newProjectData.status || 0,
        teamId: newProjectData.teamId
      };

      console.log('📤 Создаем проект на сервере:', JSON.stringify(projectData, null, 2));

      // Отправляем запрос на создание проекта (используем /create, а не /add)
      const response = await api.post('/api/v1/project/create', projectData);

      console.log('📥 Ответ сервера при создании проекта:', response);

      // Сервер должен вернуть ID созданного проекта
      const projectId = response.data;
      
      if (typeof projectId === 'number' && projectId > 0) {
        console.log('✅ Проект создан на сервере, ID:', projectId);
        
        // Обновляем список проектов
        await fetchUserProjects();
        
        // Обновляем projectId в форме создания задачи
        setNewTaskData(prev => ({
          ...prev,
          projectId: projectId
        }));
        
        // Закрываем диалог
        setIsAddProjectDialogOpen(false);
        
        // Сбрасываем форму
        setNewProjectData({
          name: '',
          description: '',
          status: 0,
          teamId: teams.length > 0 ? teams[0].id : 0
        });
        
        // Показываем успех
        setSnackbarMessage('Проект успешно создан!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
      } else {
        throw new Error('Сервер не вернул ID проекта');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка создания проекта:', error);
      
      let errorMessage = 'Ошибка создания проекта';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Некорректные данные. Проверьте заполнение полей.';
        } else if (error.response.status === 401) {
          logout();
          navigate('/login');
          return;
        } else if (error.response.status === 409) {
          errorMessage = 'Проект с таким названием уже существует';
        } else if (error.response.status === 404) {
          errorMessage = 'Команда не найдена';
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Обновление статуса задачи
  // Обновление статуса задачи
const updateTaskStatus = async (taskId: number, currentStatus: number) => {
  const newStatus = currentStatus === 2 ? 0 : 2;
  
  try {
    const api = getApiInstance();
    
    console.log('🔄 Обновляем статус задачи:', { taskId, currentStatus, newStatus });
    
    // Получаем текущую задачу
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) {
      setSnackbarMessage('Задача не найдена');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Получаем актуальное название проекта
    const projectName = getProjectNameById(currentTask.projectId || 0);
    
    // Подготавливаем данные для обновления
    const updateData: any = {
      id: taskId,
      title: currentTask.title,
      description: currentTask.description || "",
      status: newStatus,
      priority: currentTask.priority,
      projectId: currentTask.projectId || null
    };
    
    // Добавляем dueDate если есть
    if (currentTask.deadline) {
      try {
        const deadlineDate = new Date(currentTask.deadline);
        if (!isNaN(deadlineDate.getTime())) {
          const year = deadlineDate.getFullYear();
          const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
          const day = String(deadlineDate.getDate()).padStart(2, '0');
          updateData.dueDate = `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.warn('Ошибка форматирования даты:', e);
      }
    }
    
    console.log('📤 Данные для обновления задачи:', JSON.stringify(updateData, null, 2));
    
    const response = await api.put('/api/v1/task/update', updateData);
    
    console.log('✅ Ответ сервера:', response.data);
    
    if (response.data === true) {
      // Обновляем локальное состояние с корректным названием проекта
      const updatedTask = {
        ...currentTask,
        status: newStatus,
        projectName: projectName,
        updatedAt: new Date().toISOString()
      };
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      setTasks(updatedTasks);
      
      // Также обновляем кеш
      localStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
      
      setSnackbarMessage('Статус задачи обновлен');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    
  } catch (error: any) {
    console.error('❌ Ошибка обновления статуса задачи:', error);
    
    if (error.response?.status === 401) {
      logout();
      navigate('/login');
    } else {
      setSnackbarMessage(error.response?.data?.message || 'Ошибка обновления статуса задачи');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }
};

  // Создание новой задачи ТОЛЬКО НА СЕРВЕРЕ
  const handleSaveNewTask = async () => {
  if (!newTaskData.title.trim()) {
    setSnackbarMessage('Введите название задачи!');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return;
  }

  // Отладочный вывод
  console.log('🔍 Данные формы перед отправкой:', {
    title: newTaskData.title,
    priority: newTaskData.priority,
    priorityLabel: PRIORITY_RU_MAP[newTaskData.priority] || 'Неизвестно'
  });

  if (!newTaskData.projectId || newTaskData.projectId <= 0) {
    setSnackbarMessage('Выберите проект!');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return;
  }

  try {
    const api = getApiInstance();
    
    // ВАЖНО: Приводим priority к числу
    const priorityValue = Number(newTaskData.priority);
    if (isNaN(priorityValue)) {
      console.error('❌ Некорректное значение приоритета:', newTaskData.priority);
      setSnackbarMessage('Некорректный приоритет задачи');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    const taskData: any = {
      title: newTaskData.title.trim(),
      description: newTaskData.description?.trim() || "",
      priority: priorityValue, // ← Явное преобразование
      status: newTaskData.status || 0,
      projectId: newTaskData.projectId
    };

    console.log('📤 Создаем задачу на сервере:', {
      ...taskData,
      priorityLabel: PRIORITY_RU_MAP[priorityValue]
    });

    // Форматируем дату если есть
    if (newTaskData.deadline && newTaskData.deadline.trim()) {
      try {
        const deadlineDate = new Date(newTaskData.deadline);
        if (!isNaN(deadlineDate.getTime())) {
          const year = deadlineDate.getFullYear();
          const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
          const day = String(deadlineDate.getDate()).padStart(2, '0');
          taskData.dueDate = `${year}-${month}-${day}`;
          console.log('📅 Форматированная дата:', taskData.dueDate);
        }
      } catch (e) {
        console.warn('⚠️ Ошибка форматирования даты:', e);
      }
    }

    const response = await api.post('/api/v1/task/add', taskData);

    console.log('📥 Ответ сервера при создании:', {
      data: response.data,
      status: response.status,
      statusText: response.statusText
    });

    // В функции handleSaveNewTask, после успешного создания:
const taskId = response.data;

if (typeof taskId === 'number' && taskId > 0) {
  console.log('✅ Задача создана на сервере, ID:', taskId);
  
  // Получаем название проекта для новой задачи
  const projectName = getProjectNameById(newTaskData.projectId || 0);
  
  // Создаем новую задачу с правильным названием проекта
  const newTask: Task = {
    id: taskId,
    title: newTaskData.title.trim(),
    description: newTaskData.description?.trim() || '',
    projectId: newTaskData.projectId,
    projectName: projectName,
    status: newTaskData.status || 0,
    priority: priorityValue,
    deadline: newTaskData.deadline || '',
    assigneeId: user?.id,
    assigneeName: user?.firstName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Добавляем задачу в кеш
  const cachedTasks = localStorage.getItem('user_tasks');
  if (cachedTasks) {
    try {
      const tasksList: Task[] = JSON.parse(cachedTasks);
      tasksList.unshift(newTask);
      localStorage.setItem('user_tasks', JSON.stringify(tasksList));
      setTasks(tasksList);
    } catch (e) {
      console.error('Ошибка добавления задачи в кеш:', e);
    }
  }
  
  // Закрываем диалог
  setIsAddTaskDialogOpen(false);
  
  // Сбрасываем форму
  setNewTaskData({
    title: '',
    description: '',
    projectId: projects.length > 0 ? projects[0].id : undefined,
    priority: 1,
    status: 0,
    deadline: ''
  });
  
  // Показываем успех
  setSnackbarMessage(`Задача успешно создана! Приоритет: ${PRIORITY_RU_MAP[priorityValue]}`);
  setSnackbarSeverity('success');
  setSnackbarOpen(true);
  
} else {
  console.error('❌ Неверный формат ответа:', response.data);
  throw new Error('Сервер не вернул ID задачи');
}
    
  } catch (error: any) {
    console.error('❌ Ошибка создания задачи:', {
      error,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = 'Ошибка создания задачи';
    if (error.response?.status === 400) {
      // Пробуем получить детальную информацию об ошибке
      const errorData = error.response.data;
      console.log('🔍 Детали ошибки 400:', errorData);
      
      if (typeof errorData === 'string') {
        if (errorData.includes('priority') || errorData.includes('Priority')) {
          errorMessage = 'Ошибка в приоритете задачи. Проверьте значение.';
        } else {
          errorMessage = `Некорректные данные: ${errorData}`;
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.errors) {
        // Если есть массив ошибок валидации
        const errors = Object.values(errorData.errors || {}).flat();
        errorMessage = `Ошибки валидации: ${errors.join(', ')}`;
      }
    } else if (error.response?.status === 401) {
      logout();
      navigate('/login');
      return;
    } else if (error.response?.status === 500) {
      errorMessage = 'Внутренняя ошибка сервера. Проверьте логи сервера.';
      console.error('🛠️ Детали ошибки 500:', error.response.data);
    }
    
    setSnackbarMessage(errorMessage);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  }
};

  // Обработка клика по чекбоксу
  const handleCheckboxClick = (taskId: number, currentStatus: number) => {
    console.log('📌 Клик по чекбоксу задачи:', taskId, 'текущий статус:', currentStatus);
    updateTaskStatus(taskId, currentStatus);
  };

  // Обработка клика по задаче
  const handleTaskClick = (taskId: number) => {
    navigate(`/task/${taskId}`);
  };

  const handleAddTaskClick = () => {
    setIsAddTaskDialogOpen(true);
  };

  const handleAddProjectClick = () => {
    setIsAddProjectDialogOpen(true);
  };

  const handleCancelAddTask = () => {
    setIsAddTaskDialogOpen(false);
    setNewTaskData({
      title: '',
      description: '',
      projectId: projects.length > 0 ? projects[0].id : undefined,
      priority: 1,
      status: 0,
      deadline: ''
    });
  };

  const handleCancelAddProject = () => {
    setIsAddProjectDialogOpen(false);
    setNewProjectData({
      name: '',
      description: '',
      status: 0,
      teamId: teams.length > 0 ? teams[0].id : 0
    });
  };

  const handleTaskFormChange = (field: keyof CreateTaskRequest, value: any) => {
    setNewTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectFormChange = (field: keyof CreateProjectRequest, value: any) => {
    setNewProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Получаем имя пользователя
  const getUserName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return 'Пользователь';
  };

  // Расчет статистики по задачам
  const calculateTaskStats = () => {
    const total = tasks.length;
    if (total === 0) return { done: 0, inProgress: 0, todo: 0 };
    
    const done = tasks.filter(t => t.status === 2).length;
    const inProgress = tasks.filter(t => t.status === 1).length;
    const todo = tasks.filter(t => t.status === 0).length;
    
    return {
      done: Math.round((done / total) * 100),
      inProgress: Math.round((inProgress / total) * 100),
      todo: Math.round((todo / total) * 100)
    };
  };

  const taskStats = calculateTaskStats();

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Не указано';
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      return dateString;
    } catch {
      return 'Неизвестно';
    }
  };

const getProjectStatusLabel = (status: number) => {
  switch (status) {
    case 0: return 'Активный';
    case 1: return 'Закрыт';
    case 2: return 'Архив';
    default: return 'Неизвестно';
  }
};

  // Получение строковых названий
  const getPriorityLabel = (priority: number) => {
  return PRIORITY_RU_MAP[priority] || 'Неизвестно';
};

  const getStatusLabel = (status: number) => {
    return STATUS_RU_MAP[status] || 'Неизвестно';
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'default'; // Не начато
      case 1: return 'primary'; // В процессе
      case 2: return 'success'; // Выполнено
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0: return 'success'; // Низкий
      case 1: return 'warning'; // Средний
      case 2: return 'error';   // Высокий
      default: return 'default';
    }
  };

  

  // Загрузка кеша и проектов при монтировании
  // В useEffect загружаем данные в правильном порядке
useEffect(() => {
  if (token) {
    const loadDataSequentially = async () => {
      try {
        // 1. Загружаем команды
        await fetchUserTeams();
        
        // 2. Загружаем проекты
        await fetchUserProjects();
        
        // 3. Только после проектов загружаем задачи
        await loadUserTasks();
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    
    loadDataSequentially();
  } else {
    navigate('/login');
  }
}, [token]);

// Эффект для обновления названий проектов в задачах
// Эффект для обновления названий проектов в задачах
useEffect(() => {
  if (projects.length > 0 && tasks.length > 0) {
    updateProjectNamesInTasks();
  }
}, [projects.length, tasks.length]); // Запускаем при изменении количества проектов или задач

  // Отладочная информация
  useEffect(() => {
    console.log('Текущие задачи в кеше:', tasks.length);
    console.log('Загружено проектов:', projects.length);
    console.log('Загружено команд:', teams.length);
  }, [tasks, projects, teams]);

  // Показываем загрузку только для проектов
  if (loading.projects || loading.teams) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Шапка с приветствием */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {getTimeBasedGreeting()}, {getUserName()}! 
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {getFormattedDate()}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Сетка */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, alignItems: 'flex-start' }}>

{/* первая колонка - задачи */}
<Box sx={{ flex: 1 }}>
  <Card sx={{ 
    border: '1px solid grey',
    borderRadius: 5,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 200px)' // Ограничиваем высоту как в Tasks
  }}>
    <CardContent sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      flex: 1,
      p: 2,
      height: '100%',
      overflow: 'hidden' // Скрываем переполнение
    }}>
      {/* Заголовок и кнопка */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: '#EDAB00',
        mb: 2,
        flexShrink: 0
      }}>
        <Typography variant="h6">
          Ваши задачи ({tasks.length})
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

      {/* Список задач ИЗ КЕША */}
      {tasks.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Нет сохраненных задач в кеше
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddTaskClick}
            sx={{
              borderColor: '#EDAB00',
              color: '#EDAB00',
              '&:hover': {
                borderColor: '#d69b00',
                backgroundColor: 'rgba(237, 171, 0, 0.04)'
              }
            }}
          >
            Создать первую задачу
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0 // Важно для правильной работы flex
        }}>
          {/* Контейнер с вертикальной прокруткой */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 1,
            minHeight: 0,
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#EDAB00',
              borderRadius: 3,
            },
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Все задачи */}
              {getSortedTasks().map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: 2,
                    borderRadius: 5,
                    border: '1px solid grey',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: '#EDAB00'
                    }
                  }}
                >
                  {/* Чекбокс */}
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    <Checkbox
                      checked={task.status === 2}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxClick(task.id, task.status);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      sx={{
                        color: 'blue',
                        '&.Mui-checked': {
                          color: 'blue',
                        },
                      }}
                    />
                  </Box>

                  {/* Основная информация - кликабельная */}
                  <Box
                    onClick={() => handleTaskClick(task.id)}
                    sx={{
                      flex: 1,
                      cursor: 'pointer'
                    }}
                  >
                    {/* Заголовок и описание */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 0.5 }}>
                          {task.title || 'Без названия'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {task.description || 'Без описания'}
                        </Typography>
                      </Box>

                      <Chip
                        label={getStatusLabel(task.status)}
                        size="small"
                        color={getStatusColor(task.status) as any}
                        sx={{ ml: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </Box>

                    {/* Метаданные */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 1.5,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        Проект: {task.projectName || 'Без проекта'}
                      </Typography>
                      
                      <Chip
                        label={getPriorityLabel(task.priority)}
                        size="small"
                        color={getPriorityColor(task.priority) as any}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {task.deadline && (
                        <Typography variant="caption" color="text.secondary">
                          Дедлайн: {formatDate(task.deadline)}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        Создано: {formatDate(task.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </CardContent>
  </Card>
</Box>

{/* Вторая колонка - Статистика и проекты */}
<Box sx={{ 
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column', 
  gap: 3, 
  minWidth: 250,
  height: '100%' 
}}>
  
  {/* Блок статистики - три диаграммы в ряд */}
  <Card sx={{ 
    border: '1px solid grey',
    borderRadius: 5,
    height: '200px', // Уменьшил высоту
    display: 'flex',
    flexDirection: 'column'
  }}>
    <CardContent sx={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      p: 2
    }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', fontSize: '1rem', mb: 2 }}>
        Статус выполнения
      </Typography>
      
      {/* Три диаграммы в ряд */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flex: 1,
        gap: 2
      }}>
        {/* Выполнено - слева */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          flex: 1
        }}>
          <Box sx={{ position: 'relative', width: 70, height: 70, mb: 1 }}>
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
                  background: `conic-gradient(#4caf50 0% ${taskStats.done}%, #e0e0e0 ${taskStats.done}% 100%)`
                }}
              />
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {taskStats.done}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" fontWeight="600" sx={{ color: '#4caf50', fontSize: '0.9rem', mb: 0.5 }}>
            Выполнено
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {tasks.filter(t => t.status === 2).length} задач
          </Typography>
        </Box>

        {/* В процессе - посередине */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          flex: 1 
        }}>
          <Box sx={{ position: 'relative', width: 70, height: 70, mb: 1 }}>
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
                  background: `conic-gradient(#2196f3 0% ${taskStats.inProgress}%, #e0e0e0 ${taskStats.inProgress}% 100%)`
                }}
              />
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {taskStats.inProgress}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" fontWeight="600" sx={{ color: '#2196f3', fontSize: '0.9rem', mb: 0.5 }}>
            В процессе
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {tasks.filter(t => t.status === 1).length} задач
          </Typography>
        </Box>

        {/* Не начато - справа */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          flex: 1 
        }}>
          <Box sx={{ position: 'relative', width: 70, height: 70, mb: 1 }}>
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
                  background: `conic-gradient(#f44336 0% ${taskStats.todo}%, #e0e0e0 ${taskStats.todo}% 100%)`
                }}
              />
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {taskStats.todo}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" fontWeight="600" sx={{ color: '#f44336', fontSize: '0.9rem', mb: 0.5 }}>
            Не начато
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {tasks.filter(t => t.status === 0).length} задач
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>

  {/* Блок Мои проекты - с вертикальной прокруткой */}
<Card sx={{ 
  border: '1px solid grey',
  borderRadius: 5,
  height: '365px', // Фиксированная высота
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden' // Скрываем переполнение
}}>
  <CardContent sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    p: 2,
    '&:last-child': { pb: 2 } // Убираем лишний отступ снизу
  }}>
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 2,
      flexShrink: 0 // Фиксируем заголовок
    }}>
      <Typography variant="h6" sx={{ color: '#EDAB00', fontSize: '1rem' }}>
        Мои проекты ({projects.length})
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate('/projects')}
          sx={{
            backgroundColor: 'black',
            color: 'white',
            textTransform: 'none',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            '&:hover': {
              backgroundColor: '#333'
            }
          }}
        >
          Все
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleAddProjectClick}
          startIcon={<Add sx={{ fontSize: '16px' }} />}
          sx={{
            backgroundColor: '#EDAB00',
            color: 'white',
            textTransform: 'none',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            '&:hover': {
              backgroundColor: '#d69b00'
            }
          }}
        >
          Добавить
        </Button>
      </Box>
    </Box>

    {/* Контейнер для проектов с вертикальной прокруткой */}
    <Box sx={{ 
      flex: 1,
      minHeight: 0, // Критически важно для прокрутки
      overflow: 'hidden', // Скрываем переполнение
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto', // Вертикальная прокрутка
        overflowX: 'hidden',
        pr: 1, // Отступ для скроллбара
        '&::-webkit-scrollbar': {
          width: 6,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: 3,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#EDAB00',
          borderRadius: 3,
        },
      }}>
        {projects.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Нет активных проектов
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddProjectClick}
              sx={{
                borderColor: '#EDAB00',
                color: '#EDAB00',
                fontSize: '0.8rem'
              }}
            >
              Создать проект
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 1 }}>
            {projects.map((project) => (
              <Box
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: '#EDAB00'
                  }
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="500" sx={{ fontSize: '0.9rem' }}>
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getProjectStatusLabel(project.status)}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  width: 80,
                  height: 6,
                  backgroundColor: '#e0e0e0', 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Box 
                    sx={{ 
                      height: '100%', 
                      backgroundColor: '#EDAB00',
                      width: `${project.progress || 0}%`,
                      borderRadius: 3
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{
                      position: 'absolute',
                      right: -35,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#EDAB00'
                    }}
                  >
                    {project.progress || 0}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
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
            <TextField
              label="Название задачи *"
              value={newTaskData.title}
              onChange={(e) => handleTaskFormChange('title', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите название задачи"
              required
            />

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

            <FormControl fullWidth size="small">
              <InputLabel>Проект *</InputLabel>
              <Select
                value={newTaskData.projectId || ''}
                label="Проект *"
                onChange={(e) => handleTaskFormChange('projectId', e.target.value ? Number(e.target.value) : undefined)}
                required
              >
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
    value={newTaskData.priority}
    label="Приоритет"
    onChange={(e) => handleTaskFormChange('priority', Number(e.target.value))}
  >
    <MenuItem value={0}>Низкий</MenuItem>   {/* ← 0 = Низкий */}
    <MenuItem value={1}>Средний</MenuItem>  {/* ← 1 = Средний */}
    <MenuItem value={2}>Высокий</MenuItem>  {/* ← 2 = Высокий */}
  </Select>
</FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={newTaskData.status}
                label="Статус"
                onChange={(e) => handleTaskFormChange('status', Number(e.target.value))}
              >
                <MenuItem value={0}>Не начато</MenuItem>
                <MenuItem value={1}>В процессе</MenuItem>
                <MenuItem value={2}>Выполнено</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Дедлайн"
              value={newTaskData.deadline}
              onChange={(e) => handleTaskFormChange('deadline', e.target.value)}
              fullWidth
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
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
            disabled={!newTaskData.title.trim() || !newTaskData.projectId}
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

      {/* Диалог добавления проекта */}
      <Dialog 
        open={isAddProjectDialogOpen} 
        onClose={handleCancelAddProject}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Создание нового проекта
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название проекта *"
              value={newProjectData.name}
              onChange={(e) => handleProjectFormChange('name', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите название проекта"
              required
            />

            <TextField
              label="Описание проекта"
              value={newProjectData.description}
              onChange={(e) => handleProjectFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="Опишите проект"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Команда *</InputLabel>
              <Select
                value={newProjectData.teamId}
                label="Команда *"
                onChange={(e) => handleProjectFormChange('teamId', Number(e.target.value))}
                required
                disabled={teams.length === 0}
              >
                {teams.length === 0 ? (
                  <MenuItem value={0}>Нет доступных команд</MenuItem>
                ) : (
                  teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {teams.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Для создания проекта нужно иметь хотя бы одну команду
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={newProjectData.status}
                label="Статус"
                onChange={(e) => handleProjectFormChange('status', Number(e.target.value))}
              >
                <MenuItem value={0}>Активный</MenuItem>
                <MenuItem value={1}>В процессе</MenuItem>
                <MenuItem value={2}>Завершен</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelAddProject}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSaveNewProject}
            variant="contained"
            disabled={!newProjectData.name.trim() || !newProjectData.teamId || teams.length === 0}
            sx={{ 
              backgroundColor: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Создать проект
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
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;