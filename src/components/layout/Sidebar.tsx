import { NavLink, useNavigate, Link } from "react-router-dom";
import { Users, CheckSquare, PieChart, Bot, LogOut, X, Settings as SettingsIcon, ChevronDown, Home } from 'lucide-react';
import { useAuthStore } from "../../stores/authStore";

interface SidebarProps {
  onClose?: () => void; 
}

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Tareas', href: '/tasks', icon: CheckSquare },
  { name: 'Finanzas', href: '/finance', icon: PieChart },
  { name: 'Socio IA', href: '/ai-chat', icon: Bot },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // Fondo ultra-suave estilo Notion (#F7F7F5) pero manteniendo un ancho cómodo (w-64)
    <div className="flex flex-col w-64 h-full bg-[#F7F7F5] border-r border-neutral-200/60 z-20 relative font-sans">
      
      {/* 1. CABECERA: Más grande y legible */}
      <div className="flex items-center justify-between h-16 px-4 mt-2 mb-6 hover:bg-neutral-200/50 mx-2 rounded-xl cursor-pointer transition-colors group">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-neutral-900 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-base font-bold text-neutral-900 truncate">
            {user?.name ? `Espacio de ${user.name.split(' ')[0]}` : 'Mi Espacio'}
          </span>
          <ChevronDown className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-600 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. ENLACES DE NAVEGACIÓN: Textos base (16px) e Iconos más grandes */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-3 mt-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Privado
        </div>
        
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose} 
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 group ${
                isActive
                  ? 'bg-neutral-200/60 text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-200/40 hover:text-neutral-900 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`flex-shrink-0 w-5 h-5 mr-3 ${
                    isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-700'
                  }`}
                />
                <span className="text-base">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. PIE DEL MENÚ: Textos más claros y espaciados */}
      <div className="p-3 mb-4">
        <div className="space-y-1">
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center w-full px-3 py-2.5 text-base font-medium text-neutral-600 rounded-lg hover:bg-neutral-200/40 hover:text-neutral-900 transition-colors duration-150 group"
          >
            <SettingsIcon strokeWidth={2} className="w-5 h-5 mr-3 text-neutral-500 group-hover:text-neutral-700" />
            Ajustes
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-base font-medium text-neutral-600 rounded-lg hover:bg-neutral-200/40 hover:text-neutral-900 transition-colors duration-150 group"
          >
            <LogOut strokeWidth={2} className="w-5 h-5 mr-3 text-neutral-500 group-hover:text-neutral-700" />
            Cerrar Sesión
          </button>
        </div>
      </div>

    </div>
  );
}