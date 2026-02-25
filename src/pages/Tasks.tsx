import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTaskStore } from '../stores/taskStores';
import { Plus, CheckSquare, Clock, AlertCircle, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import Alert from '../components/common/Alert';
import TaskModal from '../components/crm/TaskModal';
import type { Task } from '../types';

//las tarjetas apareceran de abajo hacia arriba 
const containerVariants: Variants = {
    hidden: {opacity: 0},
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants: Variants = {
    hidden: {opacity: 0, y: 20},
    visible: {opacity: 1, y: 0, transition: {type: 'spring', stiffness: 300, damping: 24}}
};
//el que le da color a la prioridad 
const getPriorityColor = (priority: string) =>{
    switch (priority){
        case 'high': return 'text-red-600 bg-red-50 border-red-100';
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
        default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
};
//el que le da color al estado
const getStatusColor = (status: string) =>{
    switch (status){
        case 'completed': return 'text-green-600 bg-green-50';
        case 'in progress': return 'text-primary-600 bg-primary-50';
        case 'pending': return 'text-orange-600 bg-orange-50';
        default: return 'text-gray-600 bg-gray-50';
    }
};

export default function Tasks (){
    const {tasks, isLoading, error, fetchTasks, deleteTask, updateTask, filters, setFilters} = useTaskStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    //cuando el usuario entre en la pagina la tarea se cargara 
    useEffect(()=>{
        fetchTasks();
    }, []);
    
    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };
    const handleDelete = async (id: string) =>{
        if(window.confirm('¿Seguro que quieres eliminar esta tarea de forma permanente?')){
            await deleteTask(id);
        }
    };
    //boton para marcar tarea como completada
    const handleComplete = async (task: Task) =>{
        await updateTask(task._id, {status: 'completed'});
    };
    return(
        <div className="space-y-6 pb-10">
      
      {/* CABECERA Y FILTROS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Tareas</h1>
          <p className="text-sm text-gray-500 mt-1">Controla tus pendientes y prioridades de un vistazo.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Filtro Inteligente: Llama al archivero y le dice que cambie el estado */}
          <select 
            className="input-field bg-white flex-1 sm:w-auto"
            value={filters.status || ''}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value="">Todas las tareas</option>
            <option value="pending">Pendientes</option>
            <option value="in progress">En Progreso</option>
            <option value="completed">Completadas</option>
          </select>

          <button 
            onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center shadow-lg shadow-primary-500/20 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Tarea</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* ÁREA DE TARJETAS (GRID) */}
      {isLoading && tasks.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
            <CheckSquare className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">Todo al día</h3>
          <p className="text-gray-500">No hay tareas que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tasks.map((task) => (
            <motion.div 
              key={task._id} 
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Decoración lateral para prioridad Alta */}
              {task.priority === 'high' && task.status !== 'completed' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
              )}

              {/* Título y Estado */}
              <div className="flex justify-between items-start mb-4">
                <h3 className={`font-semibold text-lg pr-4 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(task.status)}`}>
                  {task.status === 'in progress' ? 'En progreso' : task.status === 'completed' ? 'Lista' : 'Pendiente'}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                {task.description || 'Sin descripción adicional.'}
              </p>

              {/* Metadatos de la tarjeta */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" /> Categoría:
                  </span>
                  <span className="font-medium text-gray-700">{task.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> Prioridad:
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                {task.budget > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-50">
                    <span className="text-gray-500">Presupuesto:</span>
                    <span className="font-semibold text-gray-900">{task.budget} €</span>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                {task.status !== 'completed' ? (
                  <button 
                    onClick={() => handleComplete(task)}
                    className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Completar
                  </button>
                ) : (
                  <span className="text-sm font-medium text-gray-400">Finalizada</span>
                )}
                
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(task)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal Oculto */}
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskToEdit={taskToEdit} />
    </div>
    );
};