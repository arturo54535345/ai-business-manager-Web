import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
// Importamos el icono de hamburguesa (Menu)
import { Menu } from 'lucide-react'; 
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';

export default function MainLayout() {
    const { isAuthenticated } = useAuthStore();
    // Esta es la memoria: por defecto (false), el menú está escondido en móviles
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
        
        {/* LA SOMBRA DEL FONDO (Overlay) */}
        {/* Solo aparece si el menú está abierto (isSidebarOpen) y desaparece en PC (md:hidden). 
            Si haces clic en lo oscuro, cerramos el menú. */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* EL MENÚ LATERAL */}
        {/* Lógica: Fijo en móvil (fixed), relativo en PC (md:relative). 
            Se esconde a la izquierda (-translate-x-full) y aparece suavemente al tocar el botón. */}
        <div className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* ÁREA DE TRABAJO DINÁMICA */}
        <div className="flex-1 flex flex-col relative overflow-hidden w-full">
          
          {/* El techo fijo (Header) */}
          <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100/50 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
            
            {/* Botón de Hamburguesa: SOLO en móvil (md:hidden). Al tocarlo, abre el menú (true) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Título central solo en móvil */}
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight md:hidden">
              Panel de Control
            </h2>

            {/* Espacio vacío en móvil para centrar el título, pero lleno en PC */}
            <div className="w-6 md:hidden"></div>
            
            <h2 className="hidden md:block text-xl font-semibold text-gray-800 tracking-tight">
              Panel de Control
            </h2>
          </header>

          {/* El lienzo donde se pintan las páginas */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              <Outlet />
            </div>
          </main>

        </div>
      </div>
    );
}