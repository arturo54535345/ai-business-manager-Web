import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useClientStore } from '../stores/clientStore';
import { Plus, Search, Building2, Mail, Phone, Users, Edit2, Trash2, ArrowRight } from 'lucide-react';
import Alert from '../components/common/Alert';
import ClientModal from '../components/crm/ClientModal';
import type { Client } from '../types';

// Animaciones más suaves y controladas
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 }, // Usamos Y (movimiento vertical) en vez de X para más elegancia
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'VIP': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Prospect': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Inactive': return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
  }
};

export default function Clients() {
  const navigate = useNavigate();
  const { clients, isLoading, error, fetchClients, deleteClient } = useClientStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Cargamos clientes solo la primera vez que se monta el componente
  useEffect(() => {
    fetchClients();
  }, [fetchClients]); // Pasamos fetchClients como dependencia segura

  const handleEdit = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente de forma permanente?')) {
      await deleteClient(id);
    }
  };

  // Filtrado local en el navegador
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* CABECERA (Estilo Notion) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Directorio de Clientes</h1>
          <p className="text-sm text-neutral-500 mt-1 font-light">Gestiona tu cartera y su valor financiero.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Buscador Integrado (Como el de Tareas) */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => { setClientToEdit(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" /> Añadir Cliente
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-white rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            {/* Cabecera de la tabla ultra-limpia */}
            <thead className="bg-neutral-50/50 text-neutral-500 font-semibold text-xs uppercase tracking-wider border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4">Cliente / Empresa</th>
                <th className="px-6 py-4">Información de Contacto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            
            {/* 2. EL ARREGLO DEL BUG: Usamos AnimatePresence y condicionamos fuertemente la renderización */}
            <AnimatePresence mode="wait">
              {isLoading && clients.length === 0 ? (
                <motion.tbody key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col justify-center items-center space-y-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-900"></div>
                        <span className="text-neutral-500 font-medium text-sm">Cargando directorio...</span>
                      </div>
                    </td>
                  </tr>
                </motion.tbody>
              ) : filteredClients.length === 0 ? (
                <motion.tbody key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 mb-4">
                        <Users className="w-6 h-6 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">El directorio está vacío</h3>
                      <p className="text-neutral-500 font-light">No hemos encontrado ningún cliente que coincida con tu búsqueda.</p>
                    </td>
                  </tr>
                </motion.tbody>
              ) : (
                <motion.tbody 
                  key="content"
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="visible" 
                  className="divide-y divide-neutral-100"
                >
                  {filteredClients.map((client) => (
                    <motion.tr 
                      variants={itemVariants} 
                      key={client._id} 
                      onClick={() => navigate(`/clients/${client._id}`)} 
                      className="hover:bg-neutral-50/80 transition-all duration-200 group cursor-pointer"
                    >
                      {/* Celda Nombre/Empresa */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-sm border border-neutral-200 shadow-sm group-hover:bg-white transition-colors">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">{client.name}</p>
                            <p className="text-xs text-neutral-500 flex items-center mt-0.5 font-medium">
                              <Building2 className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                              {client.companyName || 'Independiente'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Celda Contacto */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1.5">
                          <span className="text-neutral-600 font-medium flex items-center text-sm">
                            <Mail className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                            {client.email || '—'}
                          </span>
                          <span className="text-neutral-500 font-medium flex items-center text-xs">
                            <Phone className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                            {client.phone || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Celda Estado */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border ${getCategoryColor(client.category)}`}>
                          {client.category}
                        </span>
                      </td>

                      {/* Celda Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 mr-4">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-lg transition-colors" title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(client._id); }}
                                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                          {/* Pequeña flecha sutil indicando que puedes entrar al perfil */}
                          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              )}
            </AnimatePresence>
          </table>
        </div>
      </div>

      <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clientToEdit={clientToEdit} />
    </div>
  );
}