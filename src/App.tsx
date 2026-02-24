import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard'; // 👈 1. Importamos tu nueva pantalla interactiva

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (Las puertas de entrada) */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Rutas Privadas (Envueltas en el Esqueleto del edificio) */}
        <Route element={<MainLayout />}>
          {/* 👇 2. Enganchamos tu pantalla interactiva a la ruta /dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Aquí irán las futuras pantallas de /clients, /tasks, etc. */}
        </Route>
        
        {/* Si alguien entra a la raíz de la web sin poner nada, lo mandamos al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}