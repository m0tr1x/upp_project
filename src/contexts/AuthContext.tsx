// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  firstName?: string;  // С сервера приходит nullable
  lastName?: string;   // С сервера приходит nullable
  username?: string;   // Для совместимости
  isActive?: boolean;  // Добавляем поле из сервера
  createdAt?: string;  // Добавляем поле из сервера
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any, token: string) => void; // Принимаем any, т.к. формат может меняться
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = (serverData: any, authToken: string) => {
    console.log('🔑 LOGIN - Полные данные с сервера:', serverData);
    
    // ПАРСИМ ДАННЫЕ С СЕРВЕРА
    let parsedUser: User;
    
    if (serverData.id && serverData.email) {
      // Если сервер вернул данные в правильном формате
      parsedUser = {
        id: Number(serverData.id),
        email: serverData.email,
        firstName: serverData.firstName || '',
        lastName: serverData.lastName || '',
        username: serverData.username || serverData.email.split('@')[0],
        isActive: serverData.isActive ?? true,
        createdAt: serverData.createdAt
      };
    } else if (serverData.userId) {
      // Если сервер вернул данные с полем userId вместо id
      parsedUser = {
        id: Number(serverData.userId),
        email: serverData.email || '',
        firstName: serverData.firstName || '',
        lastName: serverData.lastName || '',
        username: serverData.username || (serverData.email ? serverData.email.split('@')[0] : ''),
        isActive: serverData.isActive ?? true,
        createdAt: serverData.createdAt
      };
    } else {
      // Если формат данных неизвестен, создаем минимальный объект
      console.warn('⚠️ Неизвестный формат данных пользователя:', serverData);
      parsedUser = {
        id: 0, // Временное значение, нужно исправить
        email: 'unknown@example.com',
        firstName: '',
        lastName: '',
        username: 'user',
        isActive: true
      };
    }

    console.log('✅ Парсинг данных пользователя:', {
      'ID пользователя': parsedUser.id,
      'Email': parsedUser.email,
      'Имя': parsedUser.firstName,
      'Фамилия': parsedUser.lastName,
      'isActive': parsedUser.isActive,
      'Токен': authToken.substring(0, 20) + '...'
    });

    // КРИТИЧЕСКАЯ ПРОВЕРКА: ID должен быть больше 0
    if (parsedUser.id <= 0) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: ID пользователя некорректен:', parsedUser.id);
      console.error('Полные данные сервера:', serverData);
      
      // Пробуем извлечь ID из другого места или установить временное значение
      const possibleId = serverData.userId || serverData.Id || serverData.ID;
      if (possibleId && possibleId > 0) {
        parsedUser.id = Number(possibleId);
        console.log(`🔄 Исправляем ID на: ${parsedUser.id}`);
      } else {
        // Если ID все равно 0, запрашиваем данные о пользователе отдельным запросом
        console.warn('⚠️ ID пользователя = 0. Возможно, нужно выполнить дополнительный запрос.');
      }
    }

    setUser(parsedUser);
    setToken(authToken);
    
    try {
      localStorage.setItem('user', JSON.stringify(parsedUser));
      localStorage.setItem('token', authToken);
      console.log('💾 Данные сохранены в localStorage');
    } catch (error) {
      console.error('❌ Ошибка сохранения в localStorage:', error);
    }
  };

  const logout = () => {
    console.log('🚪 Выход из системы');
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user && !!token && user.id > 0;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};