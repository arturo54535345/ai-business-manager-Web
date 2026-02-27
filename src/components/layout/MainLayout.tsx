import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react'; 
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';

export default function MainLayout() {
    const { isAuthenticated } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
      // 👇 Añadido dark:bg-[#0a0a0a] para pintar TODO el fondo
      <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden">
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden w-full">
          
          {/* 👇 Añadido dark:bg-[#121212]/80 y dark:border-neutral-800 al Header */}
          <header className="h-16 md:h-20 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-100/50 dark:border-neutral-800/60 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 transition-colors duration-300">
            
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-100 tracking-tight md:hidden">
              Panel de Control
            </h2>

            <div className="w-6 md:hidden"></div>
            
            <h2 className="hidden md:block text-xl font-semibold text-gray-800 dark:text-neutral-100 tracking-tight">
              Panel de Control
            </h2>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              <Outlet />
            </div>
          </main>

        </div>
      </div>
    );
}