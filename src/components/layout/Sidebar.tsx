import { NavLink, useNavigate } from "react-router-dom";
// Añadimos el icono de la X para cerrar en móvil
import { LayoutDashboard, Users, CheckSquare, PieChart, Bot, LogOut, X } from 'lucide-react';
import { useAuthStore } from "../../stores/authStore";

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Tareas', href: '/tasks', icon: CheckSquare },
    { name: 'Finanzas', href: '/finance', icon: PieChart },
    { name: 'Socio IA', href: '/ai-chat', icon: Bot },
];

// Le decimos al menú que puede recibir una orden para cerrarse desde fuera
interface SidebarProps {
  onClose?: () => void; 
}

export default function Sidebar({ onClose }: SidebarProps) {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
      <div className="flex flex-col w-64 h-full bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative">
        
        {/* Cabecera del Menú */}
        <div className="flex items-center justify-between h-20 border-b border-gray-50/50 px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Manager
            </span>
          </div>
          
          {/* Este botón de cerrar SOLO es visible en pantallas pequeñas (md:hidden significa ocúltalo en PC) */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enlaces de navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              // Si estamos en móvil y tocamos un enlace, el menú se cierra automáticamente llamando a onClose
              onClick={onClose} 
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50/80 text-primary-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-full" />}
                  <item.icon
                    className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors duration-200 ${
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Pie del Menú */}
        <div className="p-4 border-t border-gray-50/50 bg-gray-50/30">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 truncate w-32">{user?.name || 'Usuario'}</span>
              <span className="text-xs text-gray-500 truncate w-32">Plan Pro</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors duration-200 group"
          >
            <LogOut className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
}