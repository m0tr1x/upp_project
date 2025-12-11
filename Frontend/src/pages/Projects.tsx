// src/pages/Projects.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
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
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Unarchive 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Типы данных согласно Swagger
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
  progress?: number;
  tasksCount?: number;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: number;
  priority: number;
  dueDate?: string;
  projectId: number;
  assigneeId?: number;
  reporterId: number;
  createdAt: string;
  updatedAt?: string;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: number;
  teamId?: number; 
}

interface UpdateProjectRequest {
  id: number;
  name?: string;
  description?: string;
  status?: number;
  teamId?: number;
}

// Добавьте эти типы данных в начало файла, после существующих типов:

// Типы для команд
interface Team {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  ownerName?: string;
  createdAt: string;
  memberCount?: number;
}

interface TeamMember {
  id: number;
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: number; // 0=Member, 1=Manager, 2=Owner
}

interface CreateTeamRequest {
  name: string;
  description?: string;
}

interface AddMemberRequest {
  email: string;
  teamId: number;
  role: number;
}

const API_BASE_URL = 'http://213.176.18.15:8080';

const Projects: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Состояния
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState({
    projects: true,
    tasks: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для UI
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [showArchived, setShowArchived] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  // Новые состояния для команд
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ [key: number]: TeamMember[] }>({});
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  // Состояния для UI команд
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isTeamDetailsDialogOpen, setIsTeamDetailsDialogOpen] = useState(false);

  // Данные для форм команд
  const [newTeamData, setNewTeamData] = useState<CreateTeamRequest>({
    name: '',
    description: ''
  });
  
  const [newMemberData, setNewMemberData] = useState<AddMemberRequest>({
    email: '',
    teamId: 0,
    role: 0
  });
  
  // Данные для форм
  const [newProjectData, setNewProjectData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    status: 0,
    teamId: undefined
  });
  
  const [editProjectData, setEditProjectData] = useState<UpdateProjectRequest>({
    id: 0,
    name: '',
    description: '',
    status: 0,
    teamId: 0
  });

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
          data: config.data
        });
        return config;
      },
      error => {
        console.error('❌ Ошибка в перехватчике запроса:', error);
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      response => {
        console.log('📥 Ответ сервера:', {
          url: response.config.url,
          status: response.status,
          data: response.data
        });
        return response;
      },
      error => {
        console.error('❌ Ошибка ответа сервера:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );

    return instance;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (dateString.includes('T')) {
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      return dateString.split('-').reverse().join('.');
    } catch (error) {
      return dateString;
    }
  };
  
  

  // Загрузка проектов (только базовые данные)
  const fetchUserProjectsBasic = async () => {
    try {
      setLoading(prev => ({ ...prev, projects: true }));
      
      const api = getApiInstance();
      console.log('📡 Запрос проектов с сервера...');
      
      const response = await api.get('/api/v1/project/projects');
      
      if (response.data && Array.isArray(response.data)) {
        console.log('📥 Получены проекты:', response.data);
        
        const formattedProjects: Project[] = response.data.map((project: any) => ({
          id: project.id || 0,
          name: project.name || 'Без названия',
          description: project.description || '',
          status: project.status || 0,
          startDate: project.startDate || undefined,
          endDate: project.endDate || undefined,
          teamId: project.teamId || 0,
          createdAt: project.createdAt || new Date().toISOString(),
          createdByUserId: project.createdByUserId || 0,
          progress: 0,
          tasksCount: 0
        }));
        
        console.log(`✅ Обработано ${formattedProjects.length} проектов`);
        
        // Сохраняем ВСЕ проекты
        setAllProjects(formattedProjects);
        
        // Фильтруем для отображения
        const projectsToShow = showArchived 
          ? formattedProjects 
          : formattedProjects.filter(p => p.status === 0);
        
        setProjects(projectsToShow);
        
        return formattedProjects;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ Ошибка загрузки проектов:', error);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Не удалось загрузить проекты. Попробуйте позже.');
      }
      
      return [];
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const refreshSingleProject = async (projectId: number) => {
    try {
      console.log(`🔄 Обновление данных проекта ID: ${projectId}`);
      
      const api = getApiInstance();
      const response = await api.get('/api/v1/project/get', {
        params: { id: projectId }
      });
      
      if (response.data) {
        const updatedProject: Project = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          status: response.data.status,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
          teamId: response.data.teamId,
          createdAt: response.data.createdAt,
          createdByUserId: response.data.createdByUserId,
          progress: allProjects.find(p => p.id === projectId)?.progress || 0,
          tasksCount: allProjects.find(p => p.id === projectId)?.tasksCount || 0
        };
        
        // Обновляем в состоянии
        setAllProjects(prev => 
          prev.map(p => p.id === projectId ? updatedProject : p)
        );
        
        // Обновляем видимые проекты
        setProjects(prev => 
          prev.map(p => p.id === projectId ? updatedProject : p)
        );
        
        console.log(`✅ Проект ${projectId} обновлен`);
      }
    } catch (error) {
      console.error(`❌ Ошибка обновления проекта ${projectId}:`, error);
    }
  };

  // Загрузка всех задач пользователя
  const fetchAllTasks = async () => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      
      const api = getApiInstance();
      let allTasksData: Task[] = [];
      
      console.log('📡 Загружаем задачи с сервера...');
      
      try {
        const response = await api.get('/api/v1/task/get/teammate');
        
        if (response.data && response.data.teammateTasks && Array.isArray(response.data.teammateTasks)) {
          response.data.teammateTasks.forEach((task: any) => {
            if (task.id && task.projectId) {
              allTasksData.push({
                id: task.id,
                title: task.title || 'Без названия',
                description: task.description,
                status: task.status || 0,
                priority: task.priority || 1,
                dueDate: task.dueDate,
                projectId: task.projectId,
                assigneeId: task.assigneeId,
                reporterId: task.reporterId || 0,
                createdAt: task.createdAt || new Date().toISOString(),
                updatedAt: task.updatedAt
              });
            }
          });
        }
      } catch (error) {
        console.log('❌ Ошибка загрузки задач:', error);
      }
      
      // Сохраняем задачи
      setAllTasks(allTasksData);
      console.log(`📥 Загружено ${allTasksData.length} задач`);
      
    } catch (error: any) {
      console.error('Ошибка загрузки задач:', error);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Функция для обновления статистики проектов
  const updateProjectsStatistics = () => {
    console.log('📊 Обновление статистики проектов...');
    console.log(`   Всего проектов: ${allProjects.length}`);
    console.log(`   Всего задач: ${allTasks.length}`);
    
    if (allProjects.length === 0 || allTasks.length === 0) {
      console.log('⚠️ Недостаточно данных для обновления статистики');
      return;
    }
    
    const updatedAllProjects = allProjects.map(project => {
      const projectTasks = allTasks.filter(task => task.projectId === project.id);
      
      const activeTasks = projectTasks.filter(task => task.status !== 2).length;
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => task.status === 2).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      console.log(`   Проект "${project.name}" (ID: ${project.id}): ${projectTasks.length} задач, ${activeTasks} активных, прогресс ${progress}%`);
      
      return {
        ...project,
        tasksCount: activeTasks,
        progress: progress
      };
    });
    
    setAllProjects(updatedAllProjects);
    
    const projectsToShow = showArchived 
      ? updatedAllProjects 
      : updatedAllProjects.filter(p => p.status === 0);
    
    setProjects(projectsToShow);
    
    console.log('✅ Статистика проектов обновлена');
  };

  // Получение реального ID пользователя
  const getRealUserId = async (): Promise<number> => {
    try {
      const api = getApiInstance();
      
      // Попробуем получить текущего пользователя через auth endpoint
      const response = await api.get('/api/v1/user/get', {
        params: { id: user?.id || 1 }
      });
      
      if (response.data && response.data.id) {
        console.log('👤 Найден пользователь с ID:', response.data.id);
        return response.data.id;
      }
      
      return user?.id || 0;
    } catch (error) {
      console.error('❌ Ошибка получения ID пользователя:', error);
      return user?.id || 0;
    }
  };

  // ============== ПРОЕКТЫ ==============

  // Создание нового проекта
  const handleSaveNewProject = async () => {
    if (!newProjectData.name.trim()) {
      setSnackbarMessage('Введите название проекта!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const api = getApiInstance();
      
      // Получаем реальный ID пользователя
      const realUserId = await getRealUserId();
      
      const projectData: any = {
        name: newProjectData.name.trim(),
        description: newProjectData.description?.trim() || "",
        status: newProjectData.status || 0,
      };

      console.log('📤 Создаем проект на сервере:', JSON.stringify(projectData, null, 2));
      console.log('👤 ID пользователя:', realUserId);

      const response = await api.post('/api/v1/project/create', projectData);
      const projectId = response.data;
      
      if (typeof projectId === 'number' && projectId > 0) {
        console.log('✅ Проект создан на сервере, ID:', projectId);
        
        // Перезагружаем ВСЕ данные
        await loadAllData();
        
        setIsAddProjectDialogOpen(false);
        
        // Сбрасываем форму
        setNewProjectData({
          name: '',
          description: '',
          status: 0,
          teamId: undefined
        });
        
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
        console.log('Детали ошибки:', error.response.data);
        if (error.response.status === 400) {
          errorMessage = 'Некорректные данные. Проверьте заполнение полей.';
        } else if (error.response.status === 401) {
          logout();
          navigate('/login');
          return;
        } else if (error.response.status === 409) {
          errorMessage = 'Проект с таким названием уже существует';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Редактирование проекта
  const handleSaveEditProject = async () => {
    if (!editProjectData.name?.trim()) {
      setSnackbarMessage('Введите название проекта!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const api = getApiInstance();
      
      const projectData: any = {
        id: editProjectData.id
      };

      if (editProjectData.name !== undefined) {
        projectData.name = editProjectData.name.trim();
      }
      
      if (editProjectData.description !== undefined) {
        projectData.description = editProjectData.description.trim() || "";
      }
      
      if (editProjectData.status !== undefined) {
        projectData.status = editProjectData.status;
      }
      
      console.log('📤 Обновляем проект на сервере:', JSON.stringify(projectData, null, 2));

      const response = await api.put('/api/v1/project/update', projectData);

      if (response.data === true) {
        console.log('✅ Проект успешно обновлен на сервере');
        
        setAllProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === editProjectData.id 
              ? { 
                  ...project, 
                  name: projectData.name || project.name,
                  description: projectData.description || project.description,
                  status: projectData.status !== undefined ? projectData.status : project.status
                }
              : project
          )
        );
        
        const projectsToShow = showArchived 
          ? allProjects.map(p => 
              p.id === editProjectData.id 
                ? { ...p, ...projectData } 
                : p
            )
          : allProjects.filter(p => p.status === 0);
        
        setProjects(projectsToShow);
        
        setIsEditProjectDialogOpen(false);
        
        setSnackbarMessage('Проект успешно обновлен!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
      } else {
        throw new Error('Сервер не подтвердил обновление');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка обновления проекта:', error);
      
      let errorMessage = 'Ошибка обновления проекта';
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      } else if (error.response?.status === 404) {
        errorMessage = 'Проект не найден';
      } else if (error.response?.status === 400) {
        errorMessage = 'Некорректные данные: ' + (error.response.data?.message || 'проверьте заполнение полей');
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Удаление (закрытие) проекта
  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Вы уверены, что хотите закрыть этот проект? Проект будет скрыт из активного списка.')) {
      return;
    }

    try {
      const api = getApiInstance();
      
      console.log(`🗑️ Закрываем проект ID: ${projectId}`);
      
      const response = await api.delete('/api/v1/project/close', {
        params: { id: projectId }
      });
      
      if (response.data === true) {
        console.log('✅ Проект успешно закрыт');
        
        await loadAllData();
        
        setSnackbarMessage('Проект успешно закрыт и скрыт из активных');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка при закрытии проекта:', error);
      
      let errorMessage = 'Не удалось закрыть проект';
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      } else if (error.response?.status === 400) {
        errorMessage = 'Невозможно закрыть проект с активными задачами';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Восстановление проекта из архива
  const handleRestoreProject = async (projectId: number) => {
    try {
      const api = getApiInstance();
      
      const projectResponse = await api.get('/api/v1/project/get', {
        params: { id: projectId }
      });
      
      const project = projectResponse.data;
      
      const updateResponse = await api.put('/api/v1/project/update', {
        id: projectId,
        name: project.name,
        description: project.description,
        status: 0
      });
      
      if (updateResponse.data === true) {
        await loadAllData();
        
        setSnackbarMessage('Проект восстановлен из архива');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
    } catch (error: any) {
      console.error('Ошибка при восстановлении проекта:', error);
      
      let errorMessage = 'Не удалось восстановить проект';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

    // ============== КОМАНДЫ ==============

  // Загрузка команд пользователя
  const fetchUserTeams = async () => {
    try {
      const api = getApiInstance();
      console.log('📡 Запрос команд с сервера...');
      
      const response = await api.get('/api/v1/team/teams');
      
      if (response.data && Array.isArray(response.data)) {
        console.log('📥 Получены команды:', response.data);
        
        const formattedTeams: Team[] = response.data.map((team: any) => ({
          id: team.id || 0,
          name: team.name || 'Без названия',
          description: team.description || '',
          ownerId: team.ownerId || 0,
          createdAt: team.createdAt || new Date().toISOString(),
          memberCount: 0
        }));
        
        setTeams(formattedTeams);
        console.log(`✅ Загружено ${formattedTeams.length} команд`);
        
        // Загружаем участников для каждой команды
        formattedTeams.forEach(team => {
          fetchTeamMembers(team.id);
        });
        
        return formattedTeams;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ Ошибка загрузки команд:', error);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
      
      return [];
    }
  };

  // Загрузка участников команды
  const fetchTeamMembers = async (teamId: number) => {
    try {
      const api = getApiInstance();
      console.log(`📡 Запрос участников команды ${teamId}...`);
      
      const response = await api.get(`/api/v1/team/teams/${teamId}/users`);
      
      if (response.data && Array.isArray(response.data)) {
        const members: TeamMember[] = response.data.map((member: any) => ({
          id: member.teammateId || 0,
          userId: member.userId || 0,
          email: member.email || '',
          firstName: member.firstName || '',
          lastName: member.lastName || '',
          role: 0 // По умолчанию Member
        }));
        
        setTeamMembers(prev => ({
          ...prev,
          [teamId]: members
        }));
        
        // Обновляем количество участников в команде
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === teamId 
              ? { ...team, memberCount: members.length }
              : team
          )
        );
        
        console.log(`✅ Загружено ${members.length} участников для команды ${teamId}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка загрузки участников команды ${teamId}:`, error);
    }
  };

  // Создание новой команды
  const handleCreateTeam = async () => {
    if (!newTeamData.name.trim()) {
      setSnackbarMessage('Введите название команды!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const api = getApiInstance();
      
      const teamData: CreateTeamRequest = {
        name: newTeamData.name.trim(),
        description: newTeamData.description?.trim() || ""
      };

      console.log('📤 Создаем команду на сервере:', JSON.stringify(teamData, null, 2));

      const response = await api.post('/api/v1/team/add', teamData);
      const teamId = response.data;
      
      if (typeof teamId === 'number' && teamId > 0) {
        console.log('✅ Команда создана на сервере, ID:', teamId);
        
        // Перезагружаем список команд
        await fetchUserTeams();
        
        setIsCreateTeamDialogOpen(false);
        
        // Сбрасываем форму
        setNewTeamData({
          name: '',
          description: ''
        });
        
        setSnackbarMessage('Команда успешно создана!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
      } else {
        throw new Error('Сервер не вернул ID команды');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка создания команды:', error);
      
      let errorMessage = 'Ошибка создания команды';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Некорректные данные. Проверьте заполнение полей.';
        } else if (error.response.status === 401) {
          logout();
          navigate('/login');
          return;
        } else if (error.response.status === 409) {
          errorMessage = 'Команда с таким названием уже существует';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Добавление участника в команду
  const handleAddMember = async () => {
    if (!newMemberData.email.trim()) {
      setSnackbarMessage('Введите email пользователя!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!newMemberData.teamId) {
      setSnackbarMessage('Выберите команду!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const api = getApiInstance();
      
      const memberData: AddMemberRequest = {
        email: newMemberData.email.trim(),
        teamId: newMemberData.teamId,
        role: newMemberData.role || 0
      };

      console.log('📤 Добавляем участника в команду:', JSON.stringify(memberData, null, 2));

      const response = await api.post('/api/v1/team/add/teammate', memberData);

      if (response.data === true) {
        console.log('✅ Участник успешно добавлен');
        
        // Обновляем список участников команды
        await fetchTeamMembers(newMemberData.teamId);
        
        setIsAddMemberDialogOpen(false);
        
        // Сбрасываем форму
        setNewMemberData({
          email: '',
          teamId: 0,
          role: 0
        });
        
        setSnackbarMessage('Участник успешно добавлен в команду!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
      } else {
        throw new Error('Сервер не подтвердил добавление участника');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка добавления участника:', error);
      
      let errorMessage = 'Ошибка добавления участника';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Некорректные данные. Проверьте email.';
        } else if (error.response.status === 401) {
          logout();
          navigate('/login');
          return;
        } else if (error.response.status === 404) {
          errorMessage = 'Пользователь с таким email не найден';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Удаление участника из команды
  const handleRemoveMember = async (teammateId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого участника из команды?')) {
      return;
    }

    try {
      const api = getApiInstance();
      
      console.log(`🗑️ Удаляем участника ID: ${teammateId}`);
      
      const response = await api.delete('/api/v1/team/delete/teammate', {
        params: { teammateId }
      });
      
      if (response.data === true) {
        console.log('✅ Участник успешно удален');
        
        // Если удаляем из выбранной команды, обновляем список участников
        if (selectedTeamId) {
          await fetchTeamMembers(selectedTeamId);
        }
        
        setSnackbarMessage('Участник успешно удален из команды');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка удаления участника:', error);
      
      let errorMessage = 'Не удалось удалить участника';
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Удаление команды
  const handleDeleteTeam = async (teamId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту команду? Это действие нельзя будет отменить.')) {
      return;
    }

    try {
      const api = getApiInstance();
      
      console.log(`🗑️ Удаляем команду ID: ${teamId}`);
      
      const response = await api.delete('/api/v1/team/close', {
        params: { id: teamId }
      });
      
      if (response.data === true) {
        console.log('✅ Команда успешно удалена');
        
        // Обновляем список команд
        await fetchUserTeams();
        
        setSnackbarMessage('Команда успешно удалена');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка удаления команды:', error);
      
      let errorMessage = 'Не удалось удалить команду';
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Просмотр деталей команды
  const handleViewTeamDetails = (teamId: number) => {
    setSelectedTeamId(teamId);
    setIsTeamDetailsDialogOpen(true);
  };

  // Обновить загрузку всех данных
  const loadAllData = async () => {
    try {
      setLoading(prev => ({ ...prev, projects: true, tasks: true }));
      
      console.log('🚀 Начинаем загрузку всех данных...');
      
      // Загружаем проекты
      await fetchUserProjectsBasic();
      
      // Загружаем задачи
      await fetchAllTasks();
      
      // Загружаем команды
      await fetchUserTeams();
      
      console.log('✅ Все данные успешно загружены');
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        projects: false, 
        tasks: false
      }));
    }
  };

  // Обновите useEffect для загрузки команд
  useEffect(() => {
    if (token) {
      console.log('🚀 Начало загрузки данных Projects...');
      loadAllData();
    } else {
      navigate('/login');
    }
  }, [token]);

  // Обработчики форм для команд
  const handleTeamFormChange = (field: keyof CreateTeamRequest, value: any) => {
    setNewTeamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMemberFormChange = (field: keyof AddMemberRequest, value: any) => {
    setNewMemberData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateTeamClick = () => {
    setIsCreateTeamDialogOpen(true);
  };

  const handleAddMemberClick = () => {
    if (teams.length === 0) {
      setSnackbarMessage('Сначала создайте команду!');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    setIsAddMemberDialogOpen(true);
  };

  const handleCancelCreateTeam = () => {
    setIsCreateTeamDialogOpen(false);
    setNewTeamData({
      name: '',
      description: ''
    });
  };

  const handleCancelAddMember = () => {
    setIsAddMemberDialogOpen(false);
    setNewMemberData({
      email: '',
      teamId: teams.length > 0 ? teams[0].id : 0,
      role: 0
    });
  };

  const handleCancelTeamDetails = () => {
    setIsTeamDetailsDialogOpen(false);
    setSelectedTeamId(null);
  };

  // Вспомогательные функции
  const getRoleLabel = (role: number): string => {
    switch (role) {
      case 0: return 'Участник';
      case 1: return 'Менеджер';
      case 2: return 'Владелец';
      default: return 'Участник';
    }
  };

  const getRoleColor = (role: number): string => {
    switch (role) {
      case 0: return 'default';
      case 1: return 'primary';
      case 2: return 'secondary';
      default: return 'default';
    }
  };

  // ============== ОБЩИЕ ФУНКЦИИ ==============

  const handleToggleArchived = () => {
    const newShowArchived = !showArchived;
    setShowArchived(newShowArchived);
    
    if (allProjects.length > 0) {
      const projectsToShow = newShowArchived 
        ? allProjects 
        : allProjects.filter(p => p.status === 0);
      
      setProjects(projectsToShow);
      console.log(`📋 ${newShowArchived ? 'Показываем ВСЕ проекты:' : 'Показываем только АКТИВНЫЕ проекты:'} ${projectsToShow.length}`);
    }
  };

  const handleEditProject = (project: Project) => {
    refreshSingleProject(project.id).then(() => {
      const updatedProject = allProjects.find(p => p.id === project.id) || project;
      
      setEditProjectData({
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description || '',
        status: updatedProject.status
      });
      
      setIsEditProjectDialogOpen(true);
    });
  };

  const calculateTotalProgress = () => {
    const activeProjects = allProjects.filter(p => p.status === 0);
    if (activeProjects.length === 0) return 0;
    
    const totalProgress = activeProjects.reduce((sum, project) => {
      return sum + (project.progress || 0);
    }, 0);
    
    return Math.round(totalProgress / activeProjects.length);
  };

  const projectStats = {
    total: allProjects.length,
    active: allProjects.filter(p => p.status === 0).length,
    archived: allProjects.filter(p => p.status === 2).length,
    closed: allProjects.filter(p => p.status === 1).length,
  };

  const handleAddProjectClick = () => {
    setIsAddProjectDialogOpen(true);
  };

  const handleCancelAddProject = () => {
    setIsAddProjectDialogOpen(false);
    setNewProjectData({
      name: '',
      description: '',
      status: 0,
      teamId: undefined
    });
  };

  const handleCancelEditProject = () => {
    setIsEditProjectDialogOpen(false);
  };

  const handleProjectFormChange = (field: keyof CreateProjectRequest, value: any) => {
    setNewProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFormChange = (field: keyof UpdateProjectRequest, value: any) => {
    setEditProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    if (token) {
      console.log('🚀 Начало загрузки данных Projects...');
      loadAllData();
    } else {
      navigate('/login');
    }
  }, [token]);

  // Обновление проектов при изменении фильтра
  useEffect(() => {
    if (allProjects.length > 0) {
      const projectsToShow = showArchived 
        ? allProjects 
        : allProjects.filter(p => p.status === 0);
      
      setProjects(projectsToShow);
    }
  }, [showArchived, allProjects]);

  if (loading.projects || loading.tasks) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 0 }}>
      {/* Заголовок страницы */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Проекты
      </Typography>

      {/* Основной контент в 2 колонки */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        alignItems: 'flex-start',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* ЛЕВАЯ КОЛОНКА (шире) */}
        <Box sx={{ 
          flex: isMobile ? 'none' : 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Блок 1: Статистика проектов */}
          <Card sx={{ 
            border: '1px solid grey', 
            borderRadius: 5,
            p: 2.5,
            minHeight: 95,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Проекты: {projectStats.active} активных, {projectStats.archived} в архиве
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'black' }}>
                Прогресс по активным проектам: {calculateTotalProgress()}%
              </Typography>
              
              {/* ПЕРЕКЛЮЧАТЕЛЬ ДЛЯ АРХИВНЫХ ПРОЕКТОВ */}
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showArchived}
                      onChange={handleToggleArchived}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      Показать архивные проекты
                    </Typography>
                  }
                />
                {projectStats.archived > 0 && (
                  <Chip 
                    label={`${projectStats.archived} в архиве`} 
                    size="small" 
                    color="default"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Card>

          {/* Блок 3: Все проекты */}
          <Card sx={{ 
            border: '1px solid grey', 
            borderRadius: 5,
            p: 3,
            minHeight: 450
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {showArchived ? 'Все проекты' : 'Активные проекты'} ({projects.length})
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {projects.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {showArchived ? 'У вас нет проектов' : 'У вас нет активных проектов'}
                  </Typography>
                </Box>
              ) : (
                projects.map((project) => (
                  <Card 
                    key={project.id} 
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 3,
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#EDAB00',
                        boxShadow: '0 0 0 1px #EDAB00'
                      }
                    }}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                      gap: isMobile ? 2 : 0
                    }}>
                      {/* ЛЕВАЯ ЧАСТЬ: Название и описание проекта */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {project.name}
                        </Typography>
                        {project.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            {project.description.length > 60 
                              ? `${project.description.substring(0, 60)}...` 
                              : project.description}
                          </Typography>
                        )}
                        
                        {/* Статус проекта */}
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={
                              project.status === 0 ? 'Активный' :
                              project.status === 1 ? 'Закрыт' : 'Архив'
                            }
                            size="small"
                            color={
                              project.status === 0 ? 'success' :
                              project.status === 1 ? 'warning' : 'default'
                            }
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                      </Box>
                      
                      {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Даты */}
                      <Box sx={{ 
                        flex: 1, 
                        mx: 2, 
                        minWidth: 150,
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 0.5 
                      }}>
                        {project.startDate && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Начало: {formatDate(project.startDate)}
                          </Typography>
                        )}
                        {project.endDate && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Окончание: {formatDate(project.endDate)}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Создан: {formatDate(project.createdAt)}
                        </Typography>
                      </Box>
                      
                      {/* ПРАВАЯ ЧАСТЬ: Действия */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        minWidth: 200,
                        justifyContent: 'flex-end'
                      }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          sx={{
                            color: '#EDAB00',
                            '&:hover': { backgroundColor: 'rgba(237, 171, 0, 0.1)' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        
                        {project.status === 0 ? (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                            }}
                            title="Закрыть проект"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreProject(project.id);
                            }}
                            sx={{
                              color: 'success.main',
                              '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                            }}
                            title="Восстановить проект"
                          >
                            <Unarchive fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          </Card>
        </Box>

        {/* ПРАВАЯ КОЛОНКА (уже) */}
        <Box sx={{ 
          flex: isMobile ? 'none' : 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Блок 2: Создать новый проект */}
          <Card sx={{ 
            border: '1px solid grey', 
            borderRadius: 5,
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 95
          }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddProjectClick}
              sx={{
                backgroundColor: '#EDAB00',
                color: 'white',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                padding: '10px 24px',
                minWidth: '200px',
                height: '44px',
                '&:hover': {
                  backgroundColor: '#d69b00'
                }
              }}
            >
              Создать новый проект
            </Button>
          </Card>

          {/* Блок 4: Управление командами */}
<Card sx={{ 
  border: '1px solid grey', 
  borderRadius: 5,
  p: 3,
  minHeight: 450
}}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
      Мои команды ({teams.length})
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<Add />}
        onClick={handleCreateTeamClick}
        sx={{
          backgroundColor: '#EDAB00',
          color: 'white',
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          '&:hover': {
            backgroundColor: '#d69b00'
          }
        }}
      >
        Создать
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Add />}
        onClick={handleAddMemberClick}
        sx={{
          borderColor: '#EDAB00',
          color: '#EDAB00',
          textTransform: 'none',
          fontSize: '0.8rem',
          '&:hover': {
            borderColor: '#d69b00'
          }
        }}
      >
        Добавить участника
      </Button>
    </Box>
  </Box>
  
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {teams.length === 0 ? (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          У вас пока нет команд
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTeamClick}
          sx={{
            backgroundColor: '#EDAB00',
            color: 'white',
            '&:hover': {
              backgroundColor: '#d69b00'
            }
          }}
        >
          Создать первую команду
        </Button>
      </Box>
    ) : (
      teams.map((team) => (
        <Card 
          key={team.id} 
          sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: 3,
            p: 2,
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#EDAB00',
              boxShadow: '0 0 0 1px #EDAB00'
            }
          }}
          onClick={() => handleViewTeamDetails(team.id)}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? 2 : 0
          }}>
            {/* ЛЕВАЯ ЧАСТЬ: Название и описание команды */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {team.name}
              </Typography>
              {team.description && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                  {team.description.length > 60 
                    ? `${team.description.substring(0, 60)}...` 
                    : team.description}
                </Typography>
              )}
              
              {/* Статистика команды */}
              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={`${team.memberCount || 0} участников`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
                {team.ownerId === user?.id && (
                  <Chip 
                    label="Владелец"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            </Box>
            
            {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Дата создания */}
            <Box sx={{ mx: 2, minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Создана: {formatDate(team.createdAt)}
              </Typography>
            </Box>
            
            {/* ПРАВАЯ ЧАСТЬ: Действия */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              justifyContent: 'flex-end'
            }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewTeamDetails(team.id);
                }}
                sx={{
                  color: '#2196f3',
                  '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                }}
                title="Просмотреть участников"
              >
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {team.memberCount || 0}
                </Typography>
              </IconButton>
              
              {team.ownerId === user?.id && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                  sx={{
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                  }}
                  title="Удалить команду"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        </Card>
      ))
    )}
  </Box>
</Card>
        </Box>
      </Box>

      {/* Диалог создания проекта */}
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
              <InputLabel>Статус</InputLabel>
              <Select<number>
                value={newProjectData.status || 0}
                label="Статус"
                onChange={(e) => handleProjectFormChange('status', Number(e.target.value))}
              >
                <MenuItem value={0}>Активный</MenuItem>
                <MenuItem value={1}>Закрыт</MenuItem>
                <MenuItem value={2}>В архиве</MenuItem>
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
            disabled={!newProjectData.name.trim()}
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

      {/* Диалог редактирования проекта */}
      <Dialog 
        open={isEditProjectDialogOpen} 
        onClose={handleCancelEditProject}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Редактирование проекта
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название проекта *"
              value={editProjectData.name || ''}
              onChange={(e) => handleEditFormChange('name', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите название проекта"
              required
            />

            <TextField
              label="Описание проекта"
              value={editProjectData.description || ''}
              onChange={(e) => handleEditFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="Опишите проект"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select<number>
                value={editProjectData.status || 0}
                label="Статус"
                onChange={(e) => handleEditFormChange('status', Number(e.target.value))}
              >
                <MenuItem value={0}>Активный</MenuItem>
                <MenuItem value={1}>Закрыт</MenuItem>
                <MenuItem value={2}>В архиве</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelEditProject}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSaveEditProject}
            variant="contained"
            disabled={!editProjectData.name?.trim()}
            sx={{ 
              backgroundColor: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Сохранить изменения
          </Button>
        </DialogActions>
      </Dialog>
            {/* Диалог создания команды */}
      <Dialog 
        open={isCreateTeamDialogOpen} 
        onClose={handleCancelCreateTeam}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Создание новой команды
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название команды *"
              value={newTeamData.name}
              onChange={(e) => handleTeamFormChange('name', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите название команды"
              required
            />

            <TextField
              label="Описание команды"
              value={newTeamData.description}
              onChange={(e) => handleTeamFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="Опишите команду"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelCreateTeam}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleCreateTeam}
            variant="contained"
            disabled={!newTeamData.name.trim()}
            sx={{ 
              backgroundColor: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Создать команду
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления участника */}
      <Dialog 
        open={isAddMemberDialogOpen} 
        onClose={handleCancelAddMember}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Добавление участника в команду
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Команда *</InputLabel>
              <Select
                value={newMemberData.teamId || ''}
                label="Команда *"
                onChange={(e) => handleMemberFormChange('teamId', Number(e.target.value))}
                required
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Email пользователя *"
              value={newMemberData.email}
              onChange={(e) => handleMemberFormChange('email', e.target.value)}
              fullWidth
              size="small"
              placeholder="Введите email пользователя"
              required
            />

            <FormControl fullWidth size="small">
              <InputLabel>Роль</InputLabel>
              <Select
                value={newMemberData.role}
                label="Роль"
                onChange={(e) => handleMemberFormChange('role', Number(e.target.value))}
              >
                <MenuItem value={0}>Участник</MenuItem>
                <MenuItem value={1}>Менеджер</MenuItem>
                <MenuItem value={2}>Владелец</MenuItem>
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
            onClick={handleAddMember}
            variant="contained"
            disabled={!newMemberData.email.trim() || !newMemberData.teamId}
            sx={{ 
              backgroundColor: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d69b00'
              }
            }}
          >
            Добавить участника
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра участников команды */}
      <Dialog 
        open={isTeamDetailsDialogOpen} 
        onClose={handleCancelTeamDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Участники команды
        </DialogTitle>
        <DialogContent>
          {selectedTeamId && (
            <Box sx={{ mt: 2 }}>
              {/* Информация о команде */}
              {(() => {
                const team = teams.find(t => t.id === selectedTeamId);
                const members = teamMembers[selectedTeamId] || [];
                
                return (
                  <>
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {team?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {team?.description || 'Нет описания'}
                      </Typography>
                    </Box>
                    
                    {/* Список участников */}
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Участники ({members.length})
                    </Typography>
                    
                    {members.length === 0 ? (
                      <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          В команде пока нет участников
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {members.map((member) => (
                          <Box
                            key={member.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1.5,
                              borderBottom: '1px solid #f0f0f0',
                              '&:last-child': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                {member.firstName} {member.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                                {member.email}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip
                                label={getRoleLabel(member.role)}
                                size="small"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                              
                              {team?.ownerId === user?.id && member.userId !== user?.id && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveMember(member.id)}
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                                  }}
                                  title="Удалить из команды"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancelTeamDetails}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none'
            }}
          >
            Закрыть
          </Button>
          <Button 
            onClick={() => {
              handleCancelTeamDetails();
              handleAddMemberClick();
            }}
            variant="outlined"
            sx={{ 
              borderColor: '#EDAB00',
              color: '#EDAB00',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#d69b00'
              }
            }}
          >
            Добавить участника
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

export default Projects;