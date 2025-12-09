// src/pages/Project.tsx (исправленная версия)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
  Breadcrumbs,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  TablePagination
} from '@mui/material';
import { 
  Add, 
  Edit, 
  PersonAdd, 
  ArrowBack, 
  Home, 
  Folder,
  Delete,
  Person,
  Search
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Типы данных согласно OpenAPI
interface Project {
  id: number;
  name: string;
  description?: string;
  status: number; // 0=Active, 1=Closed, 2=Archived
  startDate?: string;
  endDate?: string;
  teamId: number;
  createdAt: string;
  createdByUserId: number;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: number; // 0=Not started, 1=In Progress, 2=Done
  priority: number; // 0=Low, 1=Medium, 2=High
  dueDate?: string;
  projectId: number;
  assigneeId?: number;
  reporterId: number;
  createdAt: string;
  updatedAt?: string;
}

interface TeamMember {
  teammateId: number;
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: number;
  priority: number;
  dueDate?: string;
  projectId: number;
}

interface AddMemberRequest {
  email: string;
  teamId: number;
  role: number; // 0=Member, 1=Editor, 2=Admin
}

const API_BASE_URL = 'http://213.176.18.15:8080';

// Константы для маппинга
const STATUS_MAP: Record<number, string> = {
  0: 'To Do',
  1: 'In Progress',
  2: 'Done'
};

const STATUS_RU_MAP: Record<number, string> = {
  0: 'Не начато',
  1: 'В процессе',
  2: 'Выполнено'
};

const PRIORITY_MAP: Record<number, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High'
};

const PRIORITY_RU_MAP: Record<number, string> = {
  0: 'Низкий',
  1: 'Средний',
  2: 'Высокий'
};

const ROLE_MAP: Record<number, string> = {
  0: 'Участник',
  1: 'Редактор',
  2: 'Администратор'
};

// Добавьте сюда emailRegex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Вспомогательная функция для форматирования даты
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Не указано';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch {
    return dateString;
  }
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
        cursor: 'grab',
        '&:hover': {
          backgroundColor: 'action.hover'
        },
        '&:active': {
          cursor: 'grabbing',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
            {task.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {task.description || 'Без описания'}
          </Typography>
        </Box>

        <Chip
          label={PRIORITY_RU_MAP[task.priority]}
          size="small"
          color={
            task.priority === 0 ? 'success' :
            task.priority === 1 ? 'warning' : 'error'
          }
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
        borderColor: 'divider'
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          Статус: {STATUS_RU_MAP[task.status]}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {task.dueDate ? `До: ${formatDate(task.dueDate)}` : 'Без дедлайна'}
        </Typography>
      </Box>
    </Box>
  );
};

const EmptyDropArea: React.FC<{ status: number }> = ({ status }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `empty-${status}`,
    data: {
      status: status
    }
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        height: '100px',
        border: isOver ? '2px dashed #EDAB00' : '2px dashed #e0e0e0',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isOver ? 'rgba(237, 171, 0, 0.1)' : 'transparent',
        transition: 'all 0.2s ease',
        mb: 1
      }}
    >
      <Typography 
        variant="caption" 
        color={isOver ? '#EDAB00' : 'text.secondary'}
        sx={{ fontSize: '0.7rem' }}
      >
        Перетащите задачу сюда
      </Typography>
    </Box>
  );
};

const TaskColumn: React.FC<{
  title: string;
  tasks: Task[];
  status: number;
  onAddTask?: () => void;
}> = ({ title, tasks, status, onAddTask }) => {
  const columnId = `${status}-column`;

  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
    data: {
      status: status
    }
  });

  return (
    <Card 
      ref={setNodeRef}
      sx={{ 
        border: isOver ? '2px solid #EDAB00' : '1px solid grey',
        borderRadius: 5,
        flex: 1,
        height: 600,
        backgroundColor: isOver ? 'rgba(237, 171, 0, 0.05)' : 'background.paper',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          flexShrink: 0
        }}>
          <Typography variant="h6" sx={{ color: '#EDAB00' }}>
            {title} ({tasks.length})
          </Typography>
          {onAddTask && status === 0 && (
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

        <Box sx={{ 
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 1,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tasks.length > 0 ? (
                <SortableContext items={tasks.map((task: Task) => task.id)} strategy={verticalListSortingStrategy}>
                  {tasks.map((task: Task) => (
                    <SortableTask key={task.id} task={task} />
                  ))}
                </SortableContext>
              ) : (
                <EmptyDropArea status={status} />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, logout, user } = useAuth(); 

  // Состояния для данных
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState({
    project: true,
    tasks: false,
    members: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // UI состояния
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Для модального окна участников
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Данные для форм
  const [editProjectData, setEditProjectData] = useState({
    name: '',
    description: '',
    status: 0,
    endDate: ''
  });
  
  const [newTaskData, setNewTaskData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    status: 0,
    priority: 1,
    dueDate: '',
    projectId: parseInt(id || '0')
  });

  // Сенсоры для Drag-and-Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  // Создаем axios instance
  const getApiInstance = () => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  // Форматирование даты для input
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    
    try {
      if (dateString.includes('-')) {
        return dateString;
      }
      
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Функция для получения инициалов пользователя
  const getUserInitials = (firstName?: string, lastName?: string, email?: string): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  // Получение имени пользователя для отображения
  const getUserDisplayName = (member: TeamMember): string => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    if (member.firstName) {
      return member.firstName;
    }
    if (member.lastName) {
      return member.lastName;
    }
    return member.email;
  };

  // Загрузка данных проекта
  const fetchProjectData = async () => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, project: true, members: true }));
      const api = getApiInstance();

      console.log('🔄 Загрузка данных проекта ID:', id);
      
      // Загружаем проект
      const projectResponse = await api.get('/api/v1/project/get', {
        params: { id: parseInt(id) }
      });
      
      if (projectResponse.data) {
        setProject(projectResponse.data);
        
        // Устанавливаем данные для формы редактирования
        setEditProjectData({
          name: projectResponse.data.name,
          description: projectResponse.data.description || '',
          status: projectResponse.data.status,
          endDate: formatDateForInput(projectResponse.data.endDate)
        });
        
        // Загружаем задачи проекта
        await fetchProjectTasks(parseInt(id));
        
        // Загружаем участников команды
        await fetchTeamMembers(projectResponse.data.teamId);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки проекта:', error);
      setError('Не удалось загрузить данные проекта');
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(prev => ({ ...prev, project: false, members: false }));
    }
  };

  // Загрузка задач проекта
  const fetchProjectTasks = async (projectId: number) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      
      const api = getApiInstance();
      
      const response = await api.get('/api/v1/task/get/teammate');
      
      if (response.data?.teammateTasks) {
        const allTasks: Task[] = response.data.teammateTasks.map((task: any) => ({
          id: task.id,
          title: task.title || 'Без названия',
          description: task.description,
          status: task.status || 0,
          priority: task.priority !== undefined ? Number(task.priority) : 1,
          dueDate: task.dueDate,
          projectId: task.projectId,
          assigneeId: task.assigneeId,
          reporterId: task.reporterId || 0,
          createdAt: task.createdAt || new Date().toISOString(),
          updatedAt: task.updatedAt
        }));
        
        // Сохраняем ВСЕ задачи в кеш
        localStorage.setItem('user_tasks', JSON.stringify(allTasks));
        
        // Фильтруем задачи по текущему проекту
        const projectTasks = allTasks.filter((task: Task) => task.projectId === projectId);
        setTasks(projectTasks);
        
        console.log('📊 Задачи проекта:', {
          всегоЗадач: allTasks.length,
          задачВПроекте: projectTasks.length
        });
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки задач проекта:', error);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Загрузка участников команды
  const fetchTeamMembers = async (teamId: number) => {
    try {
      const api = getApiInstance();
      
      const response = await api.get(`/api/v1/team/teams/${teamId}/users`);
      
      if (response.data && Array.isArray(response.data)) {
        setMembers(response.data);
        console.log('👥 Загружены участники команды:', response.data.length);
      }
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    }
  };

  // Drag-and-Drop обработчики
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t: Task) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    let newStatus = 0;
    
    if (over.data.current?.status !== undefined) {
      newStatus = over.data.current.status;
    } else {
      const overTask = tasks.find((t: Task) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        return;
      }
    }

    try {
      const task = tasks.find((t: Task) => t.id === taskId);
      if (!task) return;

      const api = getApiInstance();
      const updateData = {
        id: taskId,
        title: task.title,
        description: task.description || "",
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate || null,
        projectId: task.projectId
      };

      await api.put('/api/v1/task/update', updateData);

      // Обновляем локальное состояние
      const updatedTasks = tasks.map((t: Task) => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      
      setTasks(updatedTasks);
      
      // Обновляем кеш
      const cachedTasks = localStorage.getItem('user_tasks');
      if (cachedTasks) {
        const allTasks: Task[] = JSON.parse(cachedTasks);
        const updatedAllTasks = allTasks.map((task: Task) => 
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        localStorage.setItem('user_tasks', JSON.stringify(updatedAllTasks));
      }
      
      showSnackbar('Статус задачи обновлен', 'success');
    } catch (error) {
      console.error('Ошибка обновления статуса задачи:', error);
      showSnackbar('Ошибка обновления статуса задачи', 'error');
    }
  };

  // Редактирование проекта
  const handleSaveProject = async () => {
    if (!project) return;
    
    try {
      const api = getApiInstance();
      const updateData = {
        id: project.id,
        name: editProjectData.name,
        description: editProjectData.description,
        status: editProjectData.status,
        teamId: project.teamId
      };

      const response = await api.put('/api/v1/project/update', updateData);
      
      if (response.data === true) {
        setProject(prev => prev ? { ...prev, ...updateData } : null);
        setIsEditDialogOpen(false);
        showSnackbar('Проект обновлен', 'success');
      }
    } catch (error: any) {
      console.error('Ошибка обновления проекта:', error);
      showSnackbar('Ошибка обновления проекта', 'error');
    }
  };

  
  // Добавление участника с проверкой на дублирование
const handleAddMember = async () => {
  if (!project) return;
  
  if (!newMemberEmail.trim()) {
    showSnackbar('Введите email участника', 'error');
    return;
  }

  if (!EMAIL_REGEX.test(newMemberEmail)) {
    showSnackbar('Введите корректный email', 'error');
    return;
  }

  // Проверка: пользователь не может добавить самого себя
  if (user?.email && newMemberEmail.trim().toLowerCase() === user.email.toLowerCase()) {
    showSnackbar('Вы не можете добавить самого себя в команду', 'error');
    return;
  }

  // Проверка: пользователь уже состоит в команде
  const isAlreadyMember = members.some(member => 
    member.email.toLowerCase() === newMemberEmail.trim().toLowerCase()
  );

  if (isAlreadyMember) {
    showSnackbar('Этот пользователь уже состоит в команде', 'error');
    return;
  }

  try {
    const api = getApiInstance();
    const addMemberData: AddMemberRequest = {
      email: newMemberEmail.trim(),
      teamId: project.teamId,
      role: newMemberRole
    };
    
    console.log('📤 Добавляем участника:', addMemberData);

    const response = await api.post('/api/v1/team/add/teammate', addMemberData);
    
    if (response.data === true) {
      // Очищаем форму
      setNewMemberEmail('');
      setNewMemberRole(0);
      
      // Обновляем список участников
      await fetchTeamMembers(project.teamId);
      
      showSnackbar('Участник успешно добавлен', 'success');
    }
  } catch (error: any) {
    console.error('❌ Ошибка добавления участника:', error);
    
    let errorMessage = 'Ошибка добавления участника';
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.includes('already exists') || errorData.includes('уже существует')) {
        errorMessage = 'Пользователь уже состоит в команде';
      } else if (errorData.includes('not found') || errorData.includes('не найден')) {
        errorMessage = 'Пользователь с таким email не найден';
      } else {
        errorMessage = 'Некорректные данные';
      }
    } else if (error.response?.status === 401) {
      logout();
      navigate('/login');
      return;
    }
    
    showSnackbar(errorMessage, 'error');
  }
};

  // Удаление участника
  const handleRemoveMember = async (teammateId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого участника из команды?')) {
      return;
    }

    try {
      const api = getApiInstance();
      
      const response = await api.delete('/api/v1/team/delete/teammate', {
        params: { teammateId }
      });
      
      if (response.data === true) {
        // Обновляем список участников
        if (project) {
          await fetchTeamMembers(project.teamId);
        }
        
        showSnackbar('Участник удален из команды', 'success');
      }
    } catch (error: any) {
      console.error('❌ Ошибка удаления участника:', error);
      
      let errorMessage = 'Ошибка удаления участника';
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      } else if (error.response?.status === 400) {
        errorMessage = 'Невозможно удалить владельца команды';
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  // Добавление задачи
  const handleSaveNewTask = async () => {
    try {
      const api = getApiInstance();
      
      const taskData: CreateTaskRequest = {
        title: newTaskData.title.trim(),
        description: newTaskData.description?.trim() || "",
        status: newTaskData.status || 0,
        priority: newTaskData.priority,
        dueDate: newTaskData.dueDate,
        projectId: parseInt(id || '0')
      };
      
      console.log('📤 Создаем задачу:', taskData);
      
      const response = await api.post('/api/v1/task/add', taskData);
      
      if (response.data && typeof response.data === 'number') {
        const newTaskId = response.data;
        console.log('✅ Задача создана, ID:', newTaskId);
        
        const newTask: Task = {
          id: newTaskId,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 0,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          projectId: taskData.projectId,
          reporterId: user?.id || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setTasks(prev => [...prev, newTask]);
        
        // Обновляем кеш
        const cachedTasks = localStorage.getItem('user_tasks');
        if (cachedTasks) {
          const allTasks: Task[] = JSON.parse(cachedTasks);
          const updatedTasks = [...allTasks, newTask];
          localStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
        }
        
        setIsAddTaskDialogOpen(false);
        setNewTaskData({
          title: '',
          description: '',
          status: 0,
          priority: 1,
          dueDate: '',
          projectId: parseInt(id || '0')
        });
        
        showSnackbar('Задача добавлена', 'success');
      }
    } catch (error: any) {
      console.error('❌ Ошибка добавления задачи:', error);
      
      let errorMessage = 'Ошибка добавления задачи';
      if (error.response?.status === 400) {
        errorMessage = 'Некорректные данные задачи';
      } else if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  // Вспомогательные функции
  const getRemainingDays = (endDate?: string): string => {
    if (!endDate) return 'Не указано';
    
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Просрочено';
      if (diffDays === 0) return 'Сегодня';
      return `${diffDays} дней`;
    } catch {
      return 'Не указано';
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Пагинация для таблицы участников
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Фильтрация задач по статусам
  const todoTasks = tasks.filter((task: Task) => task.status === 0);
  const inProgressTasks = tasks.filter((task: Task) => task.status === 1);
  const completedTasks = tasks.filter((task: Task) => task.status === 2);

  // Расчет прогресса
  const progress = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  // Загрузка данных при монтировании
  useEffect(() => {
    if (token && id) {
      fetchProjectData();
    } else {
      navigate('/login');
    }
  }, [token, id]);

  if (loading.project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/projects')}
            sx={{ color: '#EDAB00' }}
          >
            Назад к проектам
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || 'Проект не найден'}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}> 
      {/* Хлебные крошки */}
      <Box sx={{ mb: 1.5, mt: 1 }}> 
        <Breadcrumbs 
          aria-label="breadcrumb" 
          sx={{ 
            fontSize: '0.8rem',
            color: 'text.secondary',
            '& .MuiBreadcrumbs-separator': {
              mx: 0.5
            }
          }}
        >
          <Link 
            to="/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            
            Главная
          </Link>
          <Link 
            to="/projects" 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            
            Проекты
          </Link>
          <Typography 
            sx={{ 
              fontSize: '0.8rem',
              color: 'text.primary',
              fontWeight: 500
            }}
          >
            {project.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Шапка */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '1.75rem' }}>
            {project.name}
          </Typography>
          <IconButton
            onClick={() => setIsEditDialogOpen(true)}
            sx={{
              color: '#EDAB00',
              '&:hover': {
                backgroundColor: 'rgba(237, 171, 0, 0.1)'
              }
            }}
            size="small"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Box>

        <Button
          variant="outlined"
          startIcon={<PersonAdd />}
          onClick={() => setIsMembersDialogOpen(true)}
          sx={{
            borderColor: '#EDAB00',
            borderWidth: 2,
            backgroundColor: 'transparent',
            color: '#EDAB00',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.9rem',
            '&:hover': {
              borderColor: '#EDAB00',
              borderWidth: 2,
              backgroundColor: 'rgba(237, 171, 0, 0.1)'
            }
          }}
        >
          Участники ({members.length})
        </Button>
      </Box>

      {/* Верхний ряд - 4 одинаковых блока */}
      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
        {/* Информация о проекте */}
        <Card sx={{ border: '1px solid grey', borderRadius: 5, flex: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 2, fontSize: '1rem' }}>
              Информация о проекте
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.85rem' }}>Дата создания:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {formatDate(project.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.85rem' }}>Дедлайн:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {formatDate(project.endDate)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.85rem' }}>Время:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {getRemainingDays(project.endDate)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Описание проекта (уменьшенный) */}
        <Card sx={{ border: '1px solid grey', borderRadius: 5, flex: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 1.5, fontSize: '1rem' }}>
              Описание проекта
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: 1.6, 
                fontSize: '0.9rem',
                maxHeight: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {project.description || 'Нет описания'}
            </Typography>
          </CardContent>
        </Card>

        {/* Статистика */}
        <Card sx={{ border: '1px solid grey', borderRadius: 5, flex: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 2, fontSize: '1rem' }}>
              Статистика
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.85rem' }}>Все задачи:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>{tasks.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.85rem' }}>Выполнено:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>{completedTasks.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.85rem' }}>Прогресс:</Typography>
                <Typography variant="body2" color="#EDAB00" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                  {progress}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Команда проекта */}
        <Card sx={{ border: '1px solid grey', borderRadius: 5, flex: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#EDAB00', mb: 2, fontSize: '1rem' }}>
              Команда ({members.length})
            </Typography>
            
            {/* Список участников (первые 2) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {members.slice(0, 2).map(member => (
                <Box key={member.teammateId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Tooltip title={getUserDisplayName(member)}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {getUserDisplayName(member)}
                      </Typography>
                    </Tooltip>
                    <Tooltip title={member.email}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block'
                        }}
                      >
                        {member.email}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
              
              {members.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', textAlign: 'center', py: 1 }}>
                  Нет участников
                </Typography>
              )}
            </Box>
            
            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {members.length > 2 && (
                <Tooltip title={`Показать всех участников (${members.length})`}>
                  <Button 
                    size="small" 
                    variant="text"
                    onClick={() => setIsMembersDialogOpen(true)}
                    sx={{ 
                      fontSize: '0.7rem', 
                      color: '#EDAB00',
                      textTransform: 'none'
                    }}
                  >
                    +{members.length - 2} еще
                  </Button>
                </Tooltip>
              )}
              
              <Button 
                size="small" 
                variant="contained"
                onClick={() => setIsMembersDialogOpen(true)}
                startIcon={<PersonAdd fontSize="small" />}
                sx={{ 
                  fontSize: '0.7rem', 
                  bgcolor: '#EDAB00',
                  ml: 'auto',
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    bgcolor: '#d69b00'
                  }
                }}
              >
                Управление
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Доска задач с Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', gap: 3 }}>
          <TaskColumn
            title="Задачи на сегодня"
            tasks={todoTasks}
            status={0}
            onAddTask={() => setIsAddTaskDialogOpen(true)}
          />
          <TaskColumn
            title="В процессе"
            tasks={inProgressTasks}
            status={1}
          />
          <TaskColumn
            title="Выполненные"
            tasks={completedTasks}
            status={2}
          />
        </Box>

        <DragOverlay>
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
                opacity: 0.8,
                transform: 'rotate(5deg)',
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
                  label={PRIORITY_RU_MAP[activeTask.priority]}
                  size="small"
                  color={
                    activeTask.priority === 0 ? 'success' :
                    activeTask.priority === 1 ? 'warning' : 'error'
                  }
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
                borderColor: 'divider'
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Статус: {STATUS_RU_MAP[activeTask.status]}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {activeTask.dueDate ? `До: ${formatDate(activeTask.dueDate)}` : 'Без дедлайна'}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Диалог редактирования проекта */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold', pb: 1 }}>Редактирование проекта</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              label="Название проекта"
              value={editProjectData.name}
              onChange={(e) => setEditProjectData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
            <TextField
              label="Описание"
              value={editProjectData.description}
              onChange={(e) => setEditProjectData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
            <TextField
              label="Дедлайн"
              type="date"
              value={editProjectData.endDate}
              onChange={(e) => setEditProjectData(prev => ({ ...prev, endDate: e.target.value }))}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={editProjectData.status}
                label="Статус"
                onChange={(e) => setEditProjectData(prev => ({ ...prev, status: e.target.value as number }))}
              >
                <MenuItem value={0}>Активный</MenuItem>
                <MenuItem value={1}>Закрыт</MenuItem>
                <MenuItem value={2}>Архив</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setIsEditDialogOpen(false)} size="small">Отмена</Button>
          <Button onClick={handleSaveProject} variant="contained" size="small" sx={{ backgroundColor: '#EDAB00' }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог управления участниками (с удалением) */}
      <Dialog 
        open={isMembersDialogOpen} 
        onClose={() => setIsMembersDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold', pb: 1 }}>
          Участники команды ({members.length})
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            
            {/* Форма добавления нового участника */}
<Paper sx={{ p: 2, border: '1px solid #EDAB00', borderRadius: 2 }}>
  <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#EDAB00', fontSize: '0.9rem' }}>
    Добавить нового участника
  </Typography>
  
  {/* Предупреждения */}
  {user?.email && newMemberEmail.trim().toLowerCase() === user.email.toLowerCase() && (
    <Alert 
      severity="warning" 
      sx={{ mb: 2, fontSize: '0.8rem', py: 0.5 }}
    >
      Вы не можете добавить самого себя в команду
    </Alert>
  )}
  
  {members.some(member => 
    member.email.toLowerCase() === newMemberEmail.trim().toLowerCase()
  ) && (
    <Alert 
      severity="info" 
      sx={{ mb: 2, fontSize: '0.8rem', py: 0.5 }}
    >
      Этот пользователь уже состоит в команде
    </Alert>
  )}
  
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
    <TextField
      label="Email участника"
      value={newMemberEmail}
      onChange={(e) => setNewMemberEmail(e.target.value)}
      size="small"
      fullWidth
      placeholder="example@email.com"
      error={
        user?.email && newMemberEmail.trim().toLowerCase() === user.email.toLowerCase() ||
        members.some(member => 
          member.email.toLowerCase() === newMemberEmail.trim().toLowerCase()
        )
      }
      helperText={
        user?.email && newMemberEmail.trim().toLowerCase() === user.email.toLowerCase() 
          ? "Введите email другого пользователя" 
          : members.some(member => 
              member.email.toLowerCase() === newMemberEmail.trim().toLowerCase()
            )
            ? "Пользователь уже в команде"
            : ""
      }
    />
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Роль</InputLabel>
      <Select
        value={newMemberRole}
        label="Роль"
        onChange={(e) => setNewMemberRole(e.target.value as number)}
      >
        <MenuItem value={0}>Участник</MenuItem>
        <MenuItem value={1}>Редактор</MenuItem>
        <MenuItem value={2}>Администратор</MenuItem>
      </Select>
    </FormControl>
    <Button
  variant="contained"
  onClick={handleAddMember}
  size="small"
  disabled={
    !newMemberEmail.trim() || 
    (user?.email && newMemberEmail.trim().toLowerCase() === user.email.toLowerCase()) ||
    members.some(member => 
      member.email.toLowerCase() === newMemberEmail.trim().toLowerCase()
    ) ||
    !EMAIL_REGEX.test(newMemberEmail)  // Используйте ту же константу здесь
  }
  sx={{ 
    bgcolor: '#EDAB00',
    textTransform: 'none',
    px: 3,
    '&:hover': {
      bgcolor: '#d69b00'
    },
    '&.Mui-disabled': {
      bgcolor: '#f0f0f0',
      color: '#a0a0a0'
    }
  }}
>
  Добавить
</Button>
  </Box>
</Paper>

            {/* Таблица участников */}
            {members.length > 0 ? (
              <>
                <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Участник</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((member) => (
                          <TableRow key={member.teammateId} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                
                                <Box>
                                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                    {getUserDisplayName(member)}
                                  </Typography>
                                  {member.userId === user?.id && (
                                    <Chip 
                                      label="Вы" 
                                      size="small" 
                                      sx={{ 
                                        height: 16, 
                                        fontSize: '0.6rem',
                                        mt: 0.5,
                                        bgcolor: 'rgba(237, 171, 0, 0.1)'
                                      }} 
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                {member.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
  <Tooltip title={member.userId === user?.id ? "Удалить себя из команды" : "Удалить из команды"}>
    <IconButton
      size="small"
      onClick={() => {
        if (member.userId === user?.id) {
          if (window.confirm("Вы уверены, что хотите удалить себя из команды? Вы потеряете доступ к проекту.")) {
            handleRemoveMember(member.teammateId);
          }
        } else {
          handleRemoveMember(member.teammateId);
        }
      }}
      sx={{ 
        color: member.userId === user?.id ? 'warning.main' : 'error.main',
        '&:hover': {
          bgcolor: member.userId === user?.id ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
        }
      }}
    >
      <Delete fontSize="small" />
    </IconButton>
  </Tooltip>
</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={members.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Участников на странице:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                  sx={{
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #e0e0e0' }}>
                <Person sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  В команде пока нет участников
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Добавьте первого участника, используя форму выше
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button 
            onClick={() => setIsMembersDialogOpen(false)} 
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления задачи */}
      <Dialog open={isAddTaskDialogOpen} onClose={() => setIsAddTaskDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold', pb: 1 }}>Добавление задачи</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <TextField
              label="Название задачи"
              value={newTaskData.title}
              onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Описание"
              value={newTaskData.description}
              onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
            <TextField
              label="Дедлайн"
              type="date"
              value={newTaskData.dueDate}
              onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={newTaskData.priority}
                label="Приоритет"
                onChange={(e) => setNewTaskData(prev => ({ ...prev, priority: e.target.value as number }))}
              >
                <MenuItem value={0}>Низкий</MenuItem>
                <MenuItem value={1}>Средний</MenuItem>
                <MenuItem value={2}>Высокий</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setIsAddTaskDialogOpen(false)} size="small">Отмена</Button>
          <Button onClick={handleSaveNewTask} variant="contained" size="small" sx={{ backgroundColor: '#EDAB00' }}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} sx={{ fontSize: '0.85rem' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Project;