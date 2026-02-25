import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, AlertCircle, DollarSign, AlignLeft, CheckCircle2, Edit2, Trash2, User } from 'lucide-react';
import { useTaskStore } from '../stores/taskStores';
import { useClientStore } from '../stores/clientStore';
import TaskModal from '../components/crm/TaskModal';
import type { Task } from '../types';

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Archiveros
  const { tasks, fetchTasks, updateTask, deleteTask } = useTaskStore();
  const { clients, fetchClients } = useClientStore(); // Traemos a los clientes para cruzar los datos
  
  // Estados
  const [task, setTask] = useState<Task | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carga inicial
  useEffect(() => {
    const loadData = async () => {
      setIsInitializing(true);
      if (tasks.length === 0) await fetchTasks();
      if (clients.length === 0) await fetchClients();
      setIsInitializing(false);
    };
    loadData();
  }, []);

  // Sincronización de la tarea actual
  useEffect(() => {
    if (tasks.length > 0 && id) {
      const found = tasks.find(t => t._id === id);
      setTask(found || null);
    }
  }, [tasks, id]);

  // Funciones de acción
  const handleDelete = async () => {
    if (window.confirm('¿Eliminar esta tarea definitivamente?')) {
      if (task) {
        await deleteTask(task._id);
        navigate('/tasks'); // Devolvemos al panel tras borrar
      }
    }
  };

  const handleToggleComplete = async () => {
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(task._id, { status: newStatus });
    }
  };

  if (isInitializing) {
    return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div></div>;
  }

  if (!task) {
    return (
      <div className="text-center py-32 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Documento no encontrado</h2>
        <p className="text-neutral-500 mb-8 font-light">La tarea que buscas no existe o ha sido eliminada.</p>
        <button onClick={() => navigate('/tasks')} className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium">Volver a Proyectos</button>
      </div>
    );
  }

  // Lógica para encontrar el nombre del cliente (porque a veces el Backend solo nos da el ID)
  const taskClientId = typeof task.client === 'object' ? (task.client as any)._id : task.client;
  const associatedClient = clients.find(c => c._id === taskClientId);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* NAVEGACIÓN Y ACCIONES */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/tasks')} className="group flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
          <div className="p-1 rounded-md group-hover:bg-neutral-100 transition-colors mr-1"><ArrowLeft className="w-4 h-4" /></div>
          Volver a Proyectos
        </button>

        <div className="flex items-center space-x-2">
          {/* Botón rápido para marcar como completado */}
          <button 
            onClick={handleToggleComplete}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
              task.status === 'completed' 
                ? 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200' 
                : 'bg-white text-green-700 border-green-200 hover:bg-green-50 shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {task.status === 'completed' ? 'Reabrir Tarea' : 'Completar'}
          </button>
          
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-sm">
            <Edit2 className="w-4 h-4 mr-2 opacity-70" /> Editar
          </button>
          <button onClick={handleDelete} className="p-2 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CABECERA (Documento tipo Notion) */}
      <div className="bg-white px-8 py-10 rounded-[2rem] shadow-sm border border-neutral-200/60">
        
        {/* Título */}
        <h1 className={`text-4xl font-bold tracking-tight mb-8 ${task.status === 'completed' ? 'text-neutral-400 line-through decoration-neutral-300' : 'text-neutral-900'}`}>
          {task.title}
        </h1>

        {/* Bloque de Propiedades (Metadatos) */}
        <div className="space-y-4 max-w-2xl mb-12">
          
          {/* Estado */}
          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-2 opacity-60" /> Estado
            </div>
            <div className={`px-2.5 py-1 text-sm font-medium rounded-md border ${
              task.status === 'completed' ? 'bg-neutral-100 text-neutral-500 border-neutral-200' :
              task.status === 'in progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
              'bg-white text-neutral-700 border-neutral-200 shadow-sm'
            }`}>
              {task.status === 'in progress' ? 'En proceso' : task.status === 'pending' ? 'Pendiente' : 'Completada'}
            </div>
          </div>

          {/* Fecha Límite */}
          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-2 opacity-60" /> Fecha
            </div>
            <div className="text-sm text-neutral-900 font-medium">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-neutral-400 italic">Sin fecha asignada</span>}
            </div>
          </div>

          {/* Cliente Asociado (Navegación cruzada) */}
          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 text-sm font-medium">
              <User className="w-4 h-4 mr-2 opacity-60" /> Cliente
            </div>
            <div>
              {associatedClient ? (
                <Link to={`/clients/${associatedClient._id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 flex items-center">
                  {associatedClient.name} <ArrowLeft className="w-3 h-3 ml-1 rotate-135 opacity-0 group-hover:opacity-100 transition-opacity" style={{ transform: 'rotate(135deg)' }} />
                </Link>
              ) : (
                <span className="text-sm text-neutral-400">Cliente no asignado</span>
              )}
            </div>
          </div>

          {/* Prioridad */}
          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 text-sm font-medium">
              <AlertCircle className="w-4 h-4 mr-2 opacity-60" /> Prioridad
            </div>
            <div className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${
              task.priority === 'high' ? 'bg-red-50 text-red-600' :
              task.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {task.priority}
            </div>
          </div>

          {/* Categoría & Presupuesto */}
          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 text-sm font-medium">
              <Tag className="w-4 h-4 mr-2 opacity-60" /> Categoría
            </div>
            <div className="text-sm text-neutral-700 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
              {task.category}
            </div>
          </div>

          {task.budget > 0 && (
            <div className="flex items-center group">
              <div className="w-40 flex items-center text-neutral-500 text-sm font-medium">
                <DollarSign className="w-4 h-4 mr-2 opacity-60" /> Presupuesto
              </div>
              <div className="text-sm font-bold text-green-700">
                {task.budget} €
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="w-full h-px bg-neutral-100 my-8"></div>

        {/* Contenido (Descripción) */}
        <div>
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center mb-4">
            <AlignLeft className="w-4 h-4 mr-2" /> Notas y Detalles
          </h3>
          {task.description ? (
            <div className="text-neutral-700 leading-relaxed font-light whitespace-pre-wrap bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100">
              {task.description}
            </div>
          ) : (
            <p className="text-neutral-400 italic font-light p-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
              Esta tarea no tiene notas adicionales. Haz clic en "Editar" para añadir contexto.
            </p>
          )}
        </div>

      </div>

      {/* Modal de Edición Silencioso */}
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskToEdit={task} />
      
    </motion.div>
  );
}