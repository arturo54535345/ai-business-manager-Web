import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainLayout from './components/layout/MainLayout'; // 👈 Importamos el esqueleto

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Rutas Privadas (Envueltas en el Esqueleto MainLayout) */}
        <Route element={<MainLayout />}>
          <Route 
            path="/dashboard" 
            element={
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Bienvenido a tu Espacio de Trabajo</h1>
                <p className="text-gray-500 mt-2">Selecciona una opción en el menú lateral para comenzar.</p>
              </div>
            } 
          />
          {/* Aquí irán las futuras pantallas de /clients, /tasks, etc. */}
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}