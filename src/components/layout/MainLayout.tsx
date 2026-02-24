import {Outlet, Navigate} from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import { use } from 'react';

export default function MainLayout(){
    const {isAuthenticated} = useAuthStore();
    //protejo de gente que intente entrar sin llave, sera expulsado autmaticamnete
    if(!isAuthenticated){
        return <Navigate to="/login" replace/>;
    }
    return(
        // Fondo general de la aplicación (un gris casi blanco, muy elegante)
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* A la izquierda: Nuestro Menú Fijo */}
      <Sidebar />

      {/* A la derecha: El Área de Trabajo dinámica */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Cabecera superior simple y limpia */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-gray-100/50 flex items-center px-8 z-10 sticky top-0">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Panel de Control
          </h2>
        </header>

        {/* El contenido de la página se inyecta aquí (El lienzo) */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <Outlet /> {/* 👈 Aquí React Router inyectará las páginas de Dashboard, Clientes, etc. */}
          </div>
        </main>

      </div>
    </div>
    );
};