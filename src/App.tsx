import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Tasks from './pages/Tasks'; // 👈 Importamos la pantalla de tareas

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/tasks" element={<Tasks />} /> {/* 👈 Añadimos la ruta */}
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}