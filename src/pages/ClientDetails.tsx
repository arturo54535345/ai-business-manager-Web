import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, DollarSign, Clock, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { useClientStore } from '../stores/clientStore';
import { useTaskStore } from '../stores/taskStores';
import ClientModal from '../components/crm/ClientModal';
import type { Client } from '../types';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { clients, fetchClients, deleteClient } = useClientStore();
  const { tasks, fetchTasks, isLoading: isTasksLoading } = useTaskStore();
  
  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsInitializing(true);
      if (clients.length === 0) await fetchClients();
      if (id) await fetchTasks({ clientId: id });
      setIsInitializing(false);
    };
    loadData();
  }, [id, clients.length, fetchClients, fetchTasks]);

  useEffect(() => {
    if (clients.length > 0 && id) {
      const found = clients.find(c => c._id === id);
      setClient(found || null);
    }
  }, [clients, id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar a este cliente? Perderás su contacto en la base de datos.')) {
      if (client) {
        await deleteClient(client._id);
        navigate('/clients');
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-32 max-w-md mx-auto">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Cliente no encontrado</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-light">Es posible que este perfil haya sido eliminado.</p>
        <button onClick={() => navigate('/clients')} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all">
          Volver a la cartera
        </button>
      </div>
    );
  }

  const moneyGenerated = tasks
    .filter(t => t.status === 'completed')
    .reduce((total, t) => total + (t.budget || 0), 0);
    
  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 pb-12 max-w-5xl mx-auto transition-colors duration-300">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/clients')}
          className="group flex items-center text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <div className="p-1 rounded-md group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors mr-1">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver a clientes
        </button>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4 mr-2 opacity-70" /> Editar Perfil
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CABECERA DEL PERFIL */}
      <div className="bg-white dark:bg-[#121212] p-8 rounded-[2rem] shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-colors">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-50 dark:bg-neutral-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-4xl shadow-md border-4 border-white dark:border-[#121212] transition-colors">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3 transition-colors">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {client.companyName && (
                <span className="flex items-center"><Building2 className="w-4 h-4 mr-1.5 opacity-70" /> {client.companyName}</span>
              )}
              
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center hover:text-neutral-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline">
                  <Mail className="w-4 h-4 mr-1.5 opacity-70" /> {client.email}
                </a>
              )}
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center hover:text-neutral-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline">
                  <Phone className="w-4 h-4 mr-1.5 opacity-70" /> {client.phone}
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-4 py-1.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm font-semibold border border-neutral-200 dark:border-neutral-700 relative z-10 transition-colors">
          {client.category}
        </div>
      </div>

      {/* GRID INFERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 relative overflow-hidden group transition-colors">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-1.5 opacity-70" /> Valor Total Generado
            </h3>
            <p className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(moneyGenerated)}</p>
            <div className="absolute right-0 bottom-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <DollarSign className="w-24 h-24 text-neutral-900 dark:text-white" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 relative overflow-hidden transition-colors">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 opacity-70" /> Estado Operativo
            </h3>
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{pendingTasksCount}</p>
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">tareas en cola</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="md:col-span-2 bg-white dark:bg-[#121212] p-8 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center tracking-tight">
              <Briefcase className="w-5 h-5 mr-2 opacity-70" /> Historial de Tareas
            </h3>
            <button onClick={() => navigate('/tasks')} className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Ir al panel general &rarr;
            </button>
          </div>
          
          <div className="space-y-3">
            {isTasksLoading ? (
               <div className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-sm">Cargando historial...</div>
            ) : tasks.length === 0 ? (
              <div className="p-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center bg-neutral-50/50 dark:bg-neutral-800/30">
                <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-1">El lienzo está en blanco.</p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500">Este cliente aún no tiene proyectos asignados.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/60 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {task.status === 'completed' 
                        ? <CheckCircle2 className="w-5 h-5 text-neutral-300 dark:text-neutral-600" /> 
                        : <div className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 group-hover:border-emerald-500 transition-colors"></div>}
                    </div>
                    <div>
                      <p className={`font-semibold transition-colors ${task.status === 'completed' ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                        {task.category} <span className="mx-1.5 opacity-50">•</span> {task.budget} €
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    task.status === 'completed' ? 'bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700' : 'bg-white dark:bg-[#121212] text-neutral-900 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 shadow-sm'
                  }`}>
                    {task.status === 'in progress' ? 'En proceso' : task.status === 'pending' ? 'Pendiente' : 'Finalizada'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clientToEdit={client} 
      />

    </motion.div>
  );
}