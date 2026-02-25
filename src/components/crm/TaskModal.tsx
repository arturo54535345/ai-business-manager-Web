import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStores';
import { useClientStore } from '../../stores/clientStore'; // 👈 Importamos la memoria de clientes
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

// Las opciones que permite tu Backend
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const STATUSES: TaskStatus[] = ['pending', 'in progress', 'completed'];
const CATEGORIES: TaskCategory[] = ['Llamada', 'Reunion', 'Email','Reforma', 'Mantenimiento', 'Otro'];

export default function TaskModal({ isOpen, onClose, taskToEdit }: TaskModalProps) {
  const { addTask, updateTask, isLoading } = useTaskStore();
  
  //traigo a los clientes para asignarle a cada uno su tarea correspondiente 
  const { clients, fetchClients } = useClientStore();

  //estado interno de cada tarea
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    category: 'Llamada' as TaskCategory,
    budget: 0,
    client: '', //guardo el id del cliente 
  });

  //cuando la ventana se abre se abren los datos de cada tarea
  useEffect(() => {
    //Si no tengo clientes cargados en memoria, los pedimos al servidor
    if (clients.length === 0) fetchClients();

    //si se edita se rellena con los datos nuevos, pero si se crea aparecera todo vacio para rellenar 
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        category: taskToEdit.category,
        budget: taskToEdit.budget || 0,
        //extraigo solo el id del cliente 
        client: (taskToEdit.client && typeof taskToEdit.client === 'object') ? (taskToEdit.client as any)._id : (taskToEdit.client || ''),
      });
    } else {
      setFormData({ 
        title: '', description: '', status: 'pending', priority: 'medium', category: 'Llamada', budget: 0, client: '' 
      });
    }
  }, [taskToEdit, isOpen, clients.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, formData);
      } else {
        await addTask(formData);
      }
      onClose(); //lo cierro si todo va bien 
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Ventana Blanca */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg relative z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              <div>
                <label className="label">Título de la Tarea *</label>
                <input
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field bg-gray-50 focus:bg-white"
                  placeholder="Ej. Llamada de seguimiento..."
                />
              </div>

              <div>
                <label className="label">Cliente Asociado *</label>
                <select
                  required value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="input-field bg-gray-50 focus:bg-white"
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field bg-gray-50 focus:bg-white min-h-[100px] resize-none"
                  placeholder="Detalles de la tarea..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="input-field bg-gray-50 focus:bg-white"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in progress">En Progreso</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>
                <div>
                  <label className="label">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="input-field bg-gray-50 focus:bg-white"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta 🚨</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="input-field bg-gray-50 focus:bg-white"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Presupuesto (€)</label>
                  <input
                    type="number" min="0" value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="input-field bg-gray-50 focus:bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-gray-50">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Guardando...' : 'Guardar Tarea'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}