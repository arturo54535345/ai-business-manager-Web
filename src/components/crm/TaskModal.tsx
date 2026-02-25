import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStores';
import { useClientStore } from '../../stores/clientStore';
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultDate?: string | null; // 👈 NUEVO: Si hacemos clic en el calendario, nos pasará el día exacto
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const STATUSES: TaskStatus[] = ['pending', 'in progress', 'completed'];
const CATEGORIES: TaskCategory[] = ['Llamada', 'Reunion', 'Email', 'Llamada', 'Reforma', 'Mantenimiento', 'Otro'];

export default function TaskModal({ isOpen, onClose, taskToEdit, defaultDate }: TaskModalProps) {
  const { addTask, updateTask, isLoading } = useTaskStore();
  const { clients, fetchClients } = useClientStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    category: 'Tarea' as TaskCategory,
    budget: 0,
    client: '',
    dueDate: '', // 👈 NUEVO: Campo para la fecha límite
  });

  useEffect(() => {
    if (clients.length === 0) fetchClients();

    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        category: taskToEdit.category,
        budget: taskToEdit.budget || 0,
        client: typeof taskToEdit.client === 'object' ? (taskToEdit.client as any)._id : taskToEdit.client,
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '', // Formato YYYY-MM-DD
      });
    } else {
      // Si recibimos una fecha por defecto (porque hicimos clic en el calendario), la usamos
      setFormData({ 
        title: '', description: '', status: 'pending', priority: 'medium', category: 'Llamada', budget: 0, client: '',
        dueDate: defaultDate || new Date().toISOString().split('T')[0] 
      });
    }
  }, [taskToEdit, isOpen, clients.length, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, formData);
      } else {
        await addTask(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-lg relative z-10 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">{taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Título de la Tarea *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" placeholder="Ej. Presentación comercial..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Cliente *</label>
                  <select required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all">
                    <option value="">-- Seleccionar --</option>
                    {clients.map(client => <option key={client._id} value={client._id}>{client.name}</option>)}
                  </select>
                </div>
                <div>
                  {/* 👈 NUEVO: Campo de Fecha Límite */}
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 flex items-center"><Calendar className="w-4 h-4 mr-1" /> Fecha Límite</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all min-h-[80px] resize-none" placeholder="Detalles extra..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Estado</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })} className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white">
                    <option value="pending">Pendiente</option>
                    <option value="in progress">En Progreso</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Prioridad</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta 🚨</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Cobro (€)</label>
                  <input type="number" min="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white" />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-neutral-100">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">
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