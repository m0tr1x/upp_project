// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import SimpleLayout from './components/layout/SimpleLayout';

// Pages
import Main from './pages/Main';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import TaskPage from './pages/TaskPage'; 
import MyBoard from './pages/MyBoard';
import Project from './pages/Project';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Timer from './pages/Timer';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#EDAB00',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Главная страница - SimpleLayout с SimpleHeader */}
            <Route path="/" element={
              <SimpleLayout>
                <Main />
              </SimpleLayout>
            } />
            
            {/* Страницы аутентификации - без layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard - MainLayout с MainHeader и Sidebar */}
            <Route path="/dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />

            <Route path="/tasks" element={
              <MainLayout>
                <Tasks />
              </MainLayout>
            } />

            <Route path="/myboard" element={
              <MainLayout>
                <MyBoard />
              </MainLayout>
            } />
            
            {/* Страница задачи - MainLayout с MainHeader и Sidebar */}
            <Route path="/task/:taskId" element={
              <MainLayout>
                <TaskPage />
              </MainLayout>
            } />
            
            {/* СТРАНИЦА ПРОЕКТОВ */}
            <Route path="/projects" element={
              <MainLayout>
                <Projects />
              </MainLayout>
            } />
            
            {/* маршрут для конкретного проекта */}
            <Route path="/project/:id" element={
              <MainLayout>
                <Project />
              </MainLayout>
            } />

            <Route path="/analytics" element={
  <MainLayout>
    <Analytics />
  </MainLayout>
} />

<Route path="/calendar" element={
  <MainLayout>
    <Calendar />
  </MainLayout>
} />

<Route path="/timer" element={
  <MainLayout>
    <Timer />
  </MainLayout>
} />

<Route path="/settings" element={
  <MainLayout>
    <Settings />
  </MainLayout>
} />
            
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;