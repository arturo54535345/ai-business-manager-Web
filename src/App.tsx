import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Finance from './pages/Finance';
import AiChat from './pages/AiChat';
import Settings from './pages/Settings'; // 👈 1. IMPORTAMOS AJUSTES
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Rutas Privadas */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Módulo de Clientes */}
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          
          {/* Módulo de Tareas */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          
          {/* Otros Módulos */}
          <Route path="/finance" element={<Finance />} />
          <Route path="/ai-chat" element={<AiChat />} />
          
          {/* 👇 2. AÑADIMOS LA RUTA DE AJUSTES */}
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}