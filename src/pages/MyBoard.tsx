// src/pages/MyBoard.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Select,
  CircularProgress,
  Collapse,
  IconButton
} from '@mui/material';
import { Add, ExpandMore, ExpandLess, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  DragOverEvent,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// Тип для задачи
interface Task {
  id: number;
  title: string;
  description?: string;
  projectId: number;
  projectName?: string;
  status: number; // 0: Не начато, 1: В процессе, 2: Выполнено
  priority: number; // 0: Низкий, 1: Средний, 2: Высокий
  dueDate?: string;
  assigneeId?: number;
  reporterId: number;
  createdAt: string;
  updatedAt?: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId?: number;
  priority: number;
  status?: number;
  dueDate?: string;
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

const API_BASE_URL = 'http://213.176.18.15:8080';

// Маппинг статусов из API в UI
const STATUS_UI_MAP: Record<number, 'Не начато' | 'В процессе' | 'Выполнено'> = {
  0: 'Не начато',
  1: 'В процессе', 
  2: 'Выполнено'
};

const UI_STATUS_MAP: Record<'Не начато' | 'В процессе' | 'Выполнено', number> = {
  'Не начато': 0,
  'В процессе': 1,
  'Выполнено': 2
};

// Маппинг статусов для цветов
const STATUS_COLOR_MAP: Record<number, 'default' | 'primary' | 'success'> = {
  0: 'default', // Не начато
  1: 'primary', // В процессе
  2: 'success'  // Выполнено
};

// Маппинг приоритетов
const PRIORITY_MAP: Record<number, 'Низкий' | 'Средний' | 'Высокий'> = {
  0: 'Низкий',
  1: 'Средний',
  2: 'Высокий'
};

const PRIORITY_COLOR_MAP: Record<number, 'success' | 'warning' | 'error'> = {
  0: 'success', // Низкий
  1: 'warning', // Средний
  2: 'error'    // Высокий
};

// Максимальное количество отображаемых задач в колонке
const MAX_VISIBLE_TASKS = 5;

// Анимация для drop
const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

// Компонент сортируемой задачи
const SortableTask: React.FC<{ task: Task }> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const getStatusLabel = (status: number) => {
    return STATUS_UI_MAP[status] || 'Не начато';
  };

  const getStatusColor = (status: number) => {
    return STATUS_COLOR_MAP[status] || 'default';
  };

  const getPriorityLabel = (priority: number) => {
    return PRIORITY_MAP[priority] || 'Средний';
  };

  const getPriorityColor = (priority: number) => {
    return PRIORITY_COLOR_MAP[priority] || 'warning';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указан';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return 'Некорректная дата';
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1.5,
        borderRadius: 3,
        border: '1px solid grey',
        backgroundColor: 'background.paper',
        cursor: 'grab',
        minWidth: '100%',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderColor: '#EDAB00',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease',
        },
        '&:active': {
          cursor: 'grabbing',
        }
      }}
    >
      {/* Основное содержимое задачи */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Левая часть - название и описание */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
            {task.title || 'Без названия'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {task.description || 'Без описания'}
          </Typography>
        </Box>

        {/* Правая часть - статус */}
        <Chip
          label={getStatusLabel(task.status)}
          size="small"
          color={getStatusColor(task.status)}
          sx={{ ml: 1, fontSize: '0.6rem', height: '20px' }}
        />
      </Box>

      {/* Нижняя часть - дата создания, приоритет и дедлайн */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 1,
        pt: 0.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
        gap: 0.5
      }}>
        {/* Дата создания */}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          Создано: {formatDate(task.createdAt)}
        </Typography>
        
        {/* Приоритет */}
        <Chip
          label={getPriorityLabel(task.priority)}
          size="small"
          color={getPriorityColor(task.priority)}
          sx={{ fontSize: '0.6rem', height: '18px' }}
        />
        
        {/* Дедлайн */}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          Дедлайн: {formatDate(task.dueDate)}
        </Typography>
      </Box>
    </Box>
  );
};

// Компонент пустой области для сброса
const EmptyDropArea: React.FC<{ 
  status: 'Не начато' | 'В процессе' | 'Выполнено';
  isOver: boolean;
}> = ({ status, isOver }) => {
  const { setNodeRef } = useDroppable({
    id: `empty-${status}`,
    data: {
      status: status,
      type: 'empty-area'
    }
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        height: '80px',
        border: isOver ? '2px dashed #EDAB00' : '2px dashed #e0e0e0',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isOver ? 'rgba(237, 171, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
        transition: 'all 0.2s ease',
        mb: 1,
        animation: isOver ? 'pulse 1.5s infinite' : 'none',
        '@keyframes pulse': {
          '0%': {
            backgroundColor: 'rgba(237, 171, 0, 0.1)',
            borderColor: '#EDAB00'
          },
          '50%': {
            backgroundColor: 'rgba(237, 171, 0, 0.2)',
            borderColor: '#ffc107'
          },
          '100%': {
            backgroundColor: 'rgba(237, 171, 0, 0.1)',
            borderColor: '#EDAB00'
          }
        }
      }}
    >
      <Typography 
        variant="caption" 
        color={isOver ? '#EDAB00' : 'text.secondary'}
        sx={{ fontSize: '0.7rem', fontWeight: isOver ? 600 : 400 }}
      >
        {isOver ? 'Отпустите чтобы переместить' : 'Перетащите задачу сюда'}
      </Typography>
    </Box>
  );
};

// Компонент колонки с уникальным id
// Компонент колонки с уникальным id
const TaskColumn: React.FC<{
  title: string;
  tasks: Task[];
  status: 'Не начато' | 'В процессе' | 'Выполнено';
  onAddTask?: () => void;
  isLoading?: boolean;
  isOver?: boolean;
}> = ({ title, tasks, status, onAddTask, isLoading = false, isOver = false }) => {
  const columnId = `${status.toLowerCase().replace(' ', '-')}-column`;

  const { setNodeRef, isOver: isColumnOver } = useDroppable({
    id: columnId,
    data: {
      status: status,
      type: 'column'
    }
  });

  // Проверяем, активен ли hover над колонкой
  const showHoverEffect = isOver || isColumnOver;

  return (
    <Card 
      ref={setNodeRef}
      sx={{ 
        border: showHoverEffect ? '2px solid #EDAB00' : '1px solid grey',
        borderRadius: 5,
        flex: 1,
        height: 600, // Фиксированная высота как в Project
        backgroundColor: showHoverEffect ? 'rgba(237, 171, 0, 0.05)' : 'background.paper',
        transition: 'all 0.2s ease',
        transform: showHoverEffect ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: showHoverEffect ? '0 8px 20px rgba(237, 171, 0, 0.15)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Скрываем переполнение
      }}
    >
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        p: 2,
        '&:last-child': { pb: 2 }
      }}>
        {/* Заголовок и кнопка */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          flexShrink: 0
        }}>
          <Typography variant="h6" sx={{ color: showHoverEffect ? '#EDAB00' : 'inherit', fontSize: '1rem' }}>
            {title} ({tasks.length})
          </Typography>
          {onAddTask && status === 'Не начато' && (
            <Button
              variant="text"
              startIcon={<Add sx={{ color: '#EDAB00' }} />}
              onClick={onAddTask}
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
              Добавить
            </Button>
          )}
        </Box>

        {/* Контейнер для задач с вертикальной прокруткой */}
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
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress size={24} sx={{ color: '#EDAB00' }} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {tasks.length > 0 ? (
                  <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                  </SortableContext>
                ) : (
                  <EmptyDropArea status={status} isOver={isColumnOver} />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const MyBoard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Состояния для задач
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState({
    tasks: true,
    projects: true
  });
  
  // Состояния для UI
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  // Данные для формы добавления задачи
  const [newTaskData, setNewTaskData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    projectId: undefined,
    priority: 1,
    status: 0,
    dueDate: ''
  });

  // Сенсоры для Drag-and-Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

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
      (config: any) => {
        console.log('🔧 Отправка запроса:', {
          url: config.url,
          method: config.method,
          data: config.data
        });
        return config;
      },
      (error: any) => {
        console.error('❌ Ошибка в перехватчике запроса:', error);
        return Promise.reject(error);
      }
    );

    return instance;
  };

  // Загрузка задач пользователя
  const loadUserTasks = async () => {
  if (!token) {
    navigate('/login');
    return;
  }

  try {
    setIsLoading(prev => ({ ...prev, tasks: true }));
    
    const api = getApiInstance();
    
    // Сначала пробуем загрузить с сервера
    const response = await api.get('/api/v1/task/get/teammate');
    
    if (response.data?.teammateTasks) {
      const tasksData = response.data.teammateTasks;
      
      // Отладочный вывод для приоритетов
      console.log('🔍 Приоритеты с сервера /teammate:');
      tasksData.forEach((task: any) => {
        console.log(`  ID ${task.id}: priority = ${task.priority} (${typeof task.priority})`);
      });
      
      // Загружаем каждую задачу ОТДЕЛЬНО для получения правильного приоритета
      const detailedTasks: Task[] = [];
      
      for (const task of tasksData) {
        try {
          // Получаем детальную информацию о каждой задаче
          const detailResponse = await api.get('/api/v1/task/get', {
            params: { id: task.id }
          });
          
          const taskDetail = detailResponse.data;
          console.log(`  🔍 Детали задачи ${task.id}:`, {
            teammatePriority: task.priority,
            directPriority: taskDetail.priority,
            match: task.priority === taskDetail.priority
          });
          
          if (taskDetail) {
            detailedTasks.push({
              id: taskDetail.id,
              title: taskDetail.title || 'Без названия',
              description: taskDetail.description,
              projectId: taskDetail.projectId,
              projectName: getProjectNameById(taskDetail.projectId),
              status: taskDetail.status || 0,
              priority: Number(taskDetail.priority), // Используем приоритет из детального запроса
              dueDate: taskDetail.dueDate,
              assigneeId: taskDetail.assigneeId,
              reporterId: taskDetail.reporterId,
              createdAt: taskDetail.createdAt || new Date().toISOString(),
              updatedAt: taskDetail.updatedAt
            });
          }
        } catch (error) {
          console.warn(`Не удалось получить детали задачи ${task.id}:`, error);
        }
      }
      
      console.log('✅ Подробные задачи с приоритетами:', 
        detailedTasks.map(t => ({ id: t.id, priority: t.priority, label: PRIORITY_MAP[t.priority] }))
      );
      
      // Сохраняем в кеш
      localStorage.setItem('user_tasks', JSON.stringify(detailedTasks));
      setTasks(detailedTasks);
      
    } else {
      // Если сервер не вернул задачи, пробуем из кеша
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        const parsedTasks = JSON.parse(cachedTasks);
        console.log('📂 Загружены задачи из кеша:', parsedTasks.length);
        console.log('🔍 Приоритеты из кеша:', 
          parsedTasks.map((t: Task) => ({ id: t.id, priority: t.priority }))
        );
        setTasks(parsedTasks);
      } else {
        setTasks([]);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Ошибка загрузки задач:', error);
    
    // При ошибке загружаем из кеша
    try {
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        const parsedTasks = JSON.parse(cachedTasks);
        console.log('📂 Загружены задачи из кеша после ошибки:', parsedTasks.length);
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
      return;
    }
  } finally {
    setIsLoading(prev => ({ ...prev, tasks: false }));
  }
};

  // Загрузка проектов пользователя
  const loadUserProjects = async () => {
    if (!token) {
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, projects: true }));
      
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
        
        // Показываем только активные проекты
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
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      setProjects([]);
    } finally {
      setIsLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const getProjectNameById = (projectId: number): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : `Проект #${projectId}`;
  };

  // Обработчики для Drag-and-Drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
    console.log('🚀 Начало перетаскивания задачи:', task?.title);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (over) {
      const columnId = over.id;
      if (typeof columnId === 'string') {
        if (columnId.includes('-column') || columnId.includes('empty-')) {
          setActiveColumn(columnId);
        } else {
          setActiveColumn(null);
        }
      } else {
        const overTask = tasks.find(t => t.id === columnId);
        if (overTask) {
          const columnStatus = STATUS_UI_MAP[overTask.status];
          setActiveColumn(`${columnStatus.toLowerCase().replace(' ', '-')}-column`);
        } else {
          setActiveColumn(null);
        }
      }
    } else {
      setActiveColumn(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('🏁 Конец перетаскивания:', { active: active.id, over: over?.id });
    
    setActiveTask(null);
    setActiveColumn(null);

    if (!over) {
      console.log('❌ Перетаскивание не завершено: не над целевой областью');
      return;
    }

    const taskId = active.id as number;
    
    let newStatus: 'Не начато' | 'В процессе' | 'Выполнено' = 'Не начато';
    let targetColumnId = '';
    
    if (over.data.current?.status) {
      newStatus = over.data.current.status;
      targetColumnId = over.id as string;
      console.log(`🎯 Перетаскивание в колонку: ${newStatus}, ID: ${targetColumnId}`);
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = STATUS_UI_MAP[overTask.status] || 'Не начато';
        targetColumnId = `${STATUS_UI_MAP[overTask.status].toLowerCase().replace(' ', '-')}-column`;
        console.log(`🎯 Перетаскивание над задачей в колонке: ${newStatus}`);
      } else {
        const overIdString = String(over.id);
        if (overIdString.includes('empty-')) {
          const statusMatch = overIdString.match(/empty-(.+)/);
          if (statusMatch && statusMatch[1]) {
            const statusText = statusMatch[1].replace('-', ' ');
            if (statusText === 'не начато') newStatus = 'Не начато';
            else if (statusText === 'в процессе') newStatus = 'В процессе';
            else if (statusText === 'выполнено') newStatus = 'Выполнено';
            console.log(`🎯 Перетаскивание в пустую область колонки: ${newStatus}`);
          }
        } else if (overIdString.includes('-column')) {
          const statusMatch = overIdString.match(/(.+)-column/);
          if (statusMatch && statusMatch[1]) {
            const statusText = statusMatch[1].replace('-', ' ');
            if (statusText === 'не начато') newStatus = 'Не начато';
            else if (statusText === 'в процессе') newStatus = 'В процессе';
            else if (statusText === 'выполнено') newStatus = 'Выполнено';
            console.log(`🎯 Перетаскивание в колонку: ${newStatus}`);
          }
        } else {
          console.log('❌ Не удалось определить целевую колонку');
          return;
        }
      }
    }

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) {
      console.log('❌ Задача для обновления не найдена');
      return;
    }

    const currentStatus = STATUS_UI_MAP[taskToUpdate.status];
    if (currentStatus === newStatus) {
      console.log('ℹ️ Задача уже в целевой колонке, пропускаем обновление');
      return;
    }

    console.log(`🔄 Обновляем задачу ${taskToUpdate.title} с "${currentStatus}" на "${newStatus}"`);

    try {
      const api = getApiInstance();
      
      const updateData = {
        id: taskId,
        title: taskToUpdate.title,
        description: taskToUpdate.description || "",
        status: UI_STATUS_MAP[newStatus],
        priority: taskToUpdate.priority || 1,
        dueDate: taskToUpdate.dueDate ? 
          new Date(taskToUpdate.dueDate).toISOString().split('T')[0] : 
          null,
        projectId: taskToUpdate.projectId || null
      };
      
      console.log('📤 Отправляем обновление задачи:', JSON.stringify(updateData, null, 2));
      
      const response = await api.put('/api/v1/task/update', updateData);
      
      console.log('✅ Ответ сервера:', response.data);
      
      if (response.data === true) {
        const updatedTasks = tasks.map(task => 
          task.id === taskId ? { 
            ...task, 
            status: UI_STATUS_MAP[newStatus],
            updatedAt: new Date().toISOString()
          } : task
        );
        
        setTasks(updatedTasks);
        
        setSnackbarMessage(`Задача "${taskToUpdate.title}" перемещена в "${newStatus}"`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('🔄 Локальное состояние обновлено');
      } else {
        throw new Error('Сервер не подтвердил обновление');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка обновления задачи:', error);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setSnackbarMessage('Ошибка обновления статуса задачи');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Фильтрация задач по статусам
  const todoTasks = tasks.filter(task => STATUS_UI_MAP[task.status] === 'Не начато');
  const inProgressTasks = tasks.filter(task => STATUS_UI_MAP[task.status] === 'В процессе');
  const completedTasks = tasks.filter(task => STATUS_UI_MAP[task.status] === 'Выполнено');

  // Определяем, над какой колонкой сейчас hover
  const isColumnOver = (columnStatus: 'Не начато' | 'В процессе' | 'Выполнено') => {
    if (!activeColumn) return false;
    
    const columnId = `${columnStatus.toLowerCase().replace(' ', '-')}-column`;
    const emptyId = `empty-${columnStatus}`;
    
    if (typeof activeColumn === 'string') {
      return activeColumn === columnId || activeColumn === emptyId || 
             activeColumn.includes(columnStatus.toLowerCase().replace(' ', '-'));
    }
    
    return false;
  };

  // Обработчики для добавления задачи
  const handleAddTaskClick = () => {
    if (projects.length === 0) {
      setSnackbarMessage('Сначала создайте проект');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setIsAddTaskDialogOpen(true);
  };

  const handleSaveNewTask = async () => {
    if (!newTaskData.title.trim()) {
      setSnackbarMessage('Введите название задачи!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!newTaskData.projectId || newTaskData.projectId <= 0) {
      setSnackbarMessage('Выберите проект!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const api = getApiInstance();
      
      const taskData: any = {
        title: newTaskData.title.trim(),
        description: newTaskData.description?.trim() || "",
        priority: newTaskData.priority,
        status: newTaskData.status || 0,
        projectId: newTaskData.projectId
      };

      if (newTaskData.dueDate && newTaskData.dueDate.trim()) {
        const dueDate = new Date(newTaskData.dueDate);
        if (!isNaN(dueDate.getTime())) {
          const year = dueDate.getFullYear();
          const month = String(dueDate.getMonth() + 1).padStart(2, '0');
          const day = String(dueDate.getDate()).padStart(2, '0');
          taskData.dueDate = `${year}-${month}-${day}`;
        }
      }

      console.log('📤 Создаем задачу на сервере:', JSON.stringify(taskData, null, 2));

      const response = await api.post('/api/v1/task/add', taskData);

      console.log('📥 Ответ сервера при создании:', response);

      const taskId = response.data;
      
      if (typeof taskId === 'number' && taskId > 0) {
        console.log('✅ Задача создана на сервере, ID:', taskId);
        
        setTimeout(() => {
          loadUserTasks();
        }, 500);
        
        setIsAddTaskDialogOpen(false);
        
        setNewTaskData({
          title: '',
          description: '',
          projectId: projects.length > 0 ? projects[0].id : undefined,
          priority: 1,
          status: 0,
          dueDate: ''
        });
        
        setSnackbarMessage('Задача успешно создана!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
      } else {
        throw new Error('Сервер не вернул ID задачи');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка создания задачи:', error);
      
      let errorMessage = 'Ошибка создания задачи';
      if (error.response?.status === 400) {
        errorMessage = 'Некорректные данные. Проверьте заполнение полей.';
      } else if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancelAddTask = () => {
    setIsAddTaskDialogOpen(false);
    setNewTaskData({
      title: '',
      description: '',
      projectId: projects.length > 0 ? projects[0].id : undefined,
      priority: 1,
      status: 0,
      dueDate: ''
    });
  };

  const handleTaskFormChange = (field: keyof CreateTaskRequest, value: any) => {
    setNewTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Расчет статистики для доски
  const getBoardStatistics = () => {
    const totalTasks = tasks.length;
    const completedTasksCount = completedTasks.length;
    const pendingTasks = todoTasks.length + inProgressTasks.length;
    
    const upcomingDeadlines = tasks
      .filter(task => task.dueDate)
      .map(task => new Date(task.dueDate!).getTime())
      .filter(time => time > Date.now());
    
    const nearestDeadline = upcomingDeadlines.length > 0 
      ? new Date(Math.min(...upcomingDeadlines))
      : null;
    
    const timeRemaining = nearestDeadline 
      ? `${Math.ceil((nearestDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} дней`
      : 'Нет активных дедлайнов';

    return {
      createdDate: new Date().toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      deadline: nearestDeadline 
        ? nearestDeadline.toLocaleDateString('ru-RU')
        : 'Не указан',
      timeRemaining: timeRemaining,
      description: 'Доска для визуального управления задачами. Перетаскивайте задачи между колонками для изменения их статуса.',
      totalTasks: totalTasks,
      completedTasks: completedTasksCount,
      pendingTasks: pendingTasks,
      completionRate: totalTasks > 0 
        ? Math.round((completedTasksCount / totalTasks) * 100)
        : 0
    };
  };

  const boardData = getBoardStatistics();

  // Загрузка данных при монтировании
  useEffect(() => {
    if (token) {
      loadUserProjects();
      loadUserTasks();
    } else {
      navigate('/login');
    }
  }, [token]);

  useEffect(() => {
    if (projects.length > 0 && !newTaskData.projectId) {
      setNewTaskData(prev => ({
        ...prev,
        projectId: projects[0].id
      }));
    }
  }, [projects]);

  if (isLoading.projects) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress sx={{ color: '#EDAB00' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      flex: 1,
      pt: 1
    }}>
      {/* Заголовок страницы */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}> 
        Моя доска
      </Typography>

      {/* Верхний ряд - 3 блока */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        
        {/* Первый блок - Информация о доске */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 1
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 3 }}>
              Информация о доске
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Дата добавления */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Дата обновления:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {boardData.createdDate}
                </Typography>
              </Box>

              {/* Ближайший дедлайн */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Ближайший дедлайн:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {boardData.deadline}
                </Typography>
              </Box>

              {/* Время до дедлайна */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Осталось времени:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {boardData.timeRemaining}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Второй блок - Описание доски */}
        <Card sx={{ 
          border: '1px solid grey',
          borderRadius: 5,
          flex: 2
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 2 }}>
              Описание доски
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {boardData.description}
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
                  {boardData.totalTasks}
                </Typography>
              </Box>

              {/* Выполненные */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  Выполненные:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {boardData.completedTasks} ({boardData.completionRate}%)
                </Typography>
              </Box>

              {/* В процессе */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  В процессе:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {boardData.pendingTasks}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Нижний ряд - 3 блока с Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, minHeight: 650 }}>
          {/* Колонка "Не начато" */}
          <TaskColumn
            title="Не начато"
            tasks={todoTasks}
            status="Не начато"
            onAddTask={handleAddTaskClick}
            isLoading={isLoading.tasks}
            isOver={isColumnOver('Не начато')}
          />

          {/* Колонка "В процессе" */}
          <TaskColumn
            title="В процессе"
            tasks={inProgressTasks}
            status="В процессе"
            isLoading={isLoading.tasks}
            isOver={isColumnOver('В процессе')}
          />

          {/* Колонка "Выполнено" */}
          <TaskColumn
            title="Выполнено"
            tasks={completedTasks}
            status="Выполнено"
            isLoading={isLoading.tasks}
            isOver={isColumnOver('Выполнено')}
          />
        </Box>

        {/* Drag Overlay для отображения перетаскиваемой задачи */}
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeTask ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 1.5,
                borderRadius: 3,
                border: '1px solid grey',
                backgroundColor: 'background.paper',
                boxShadow: 3,
                opacity: 0.9,
                transform: 'rotate(3deg)',
                maxWidth: '300px',
                minWidth: '250px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                    {activeTask.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {activeTask.description || 'Без описания'}
                  </Typography>
                </Box>
                <Chip
                  label={STATUS_UI_MAP[activeTask.status] || 'Не начато'}
                  size="small"
                  color={STATUS_COLOR_MAP[activeTask.status]}
                  sx={{ ml: 1, fontSize: '0.6rem', height: '20px' }}
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 1,
                pt: 0.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                flexWrap: 'wrap',
                gap: 0.5
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Создано: {new Date(activeTask.createdAt).toLocaleDateString('ru-RU')}
                </Typography>
                <Chip
                  label={PRIORITY_MAP[activeTask.priority] || 'Средний'}
                  size="small"
                  color={PRIORITY_COLOR_MAP[activeTask.priority]}
                  sx={{ fontSize: '0.6rem', height: '18px' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Дедлайн: {activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString('ru-RU') : 'Не указан'}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mt: 0.5,
                pt: 0.5,
                borderTop: '1px dashed',
                borderColor: 'divider'
              }}>
                <Typography variant="caption" color="#EDAB00" sx={{ fontSize: '0.6rem', fontWeight: 600 }}>
                  Перетаскивайте для изменения статуса
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

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
                disabled={projects.length === 0}
              >
                {projects.length === 0 ? (
                  <MenuItem value="">
                    <Typography variant="body2" color="text.secondary">
                      Нет доступных проектов
                    </Typography>
                  </MenuItem>
                ) : (
                  projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {projects.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Для создания задачи нужно иметь хотя бы один активный проект
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={newTaskData.priority}
                label="Приоритет"
                onChange={(e) => handleTaskFormChange('priority', Number(e.target.value))}
              >
                <MenuItem value={0}>Низкий</MenuItem>
                <MenuItem value={1}>Средний</MenuItem>
                <MenuItem value={2}>Высокий</MenuItem>
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
              value={newTaskData.dueDate}
              onChange={(e) => handleTaskFormChange('dueDate', e.target.value)}
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

export default MyBoard;