import { useEffect } from 'react';
import { motion} from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useClientStore } from '../stores/clientStore';
import { Plus, Search, MoreHorizontal, Building2, Mail, Phone, Users } from 'lucide-react';
import Alert from '../components/common/Alert';

// 1. LAS LEYES DE LA FÍSICA (Animación en cascada muy rápida)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 } // Aparecen casi de golpe, pero con un micro-retraso elegante
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// 2. EL PINTOR DE ETIQUETAS (Badges): Decide qué color pintar según la categoría del cliente
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Active': return 'bg-green-100 text-green-700 border-green-200';
    case 'Prospect': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export default function Clients() {
  // 3. CONECTAMOS CON EL ARCHIVERO (Zustand)
  const { clients, isLoading, error, fetchClients } = useClientStore();

  // En cuanto el usuario pisa esta habitación, le decimos al archivero que traiga los clientes
  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      
      {/* 4. LA CABECERA (Título y Botón de Añadir) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cartera de Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona y visualiza todos los contactos de tu negocio.</p>
        </div>
        <button className="btn-primary flex items-center shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/30">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* 5. EL CONTENEDOR PRINCIPAL (La Tarjeta Blanca) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, empresa o email..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* 6. LA TABLA DE DATOS (Adaptable a móviles con overflow-x-auto) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Cliente / Empresa</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            
            <motion.tbody 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible"
              className="divide-y divide-gray-50"
            >
              {isLoading ? (
                // Estado de carga (Esqueleto temporal)
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      <span>Cargando directorio...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                // Si la base de datos está vacía
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">No hay clientes todavía</h3>
                    <p className="text-gray-500">Comienza añadiendo tu primer cliente a la cartera.</p>
                  </td>
                </tr>
              ) : (
                // Si hay clientes, los pintamos uno a uno
                clients.map((client) => (
                  <motion.tr variants={itemVariants} key={client._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {/* Avatar con las iniciales */}
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shadow-inner">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Building2 className="w-3 h-3 mr-1" />
                            {client.companyName || 'Sin empresa'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-gray-600 flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {client.email || '—'}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {client.phone || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* Aquí usamos el Pintor de Etiquetas que creamos arriba */}
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(client.category)}`}>
                        {client.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Botón de opciones que solo se oscurece al pasar el ratón por la fila */}
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

    </div>
  );
}