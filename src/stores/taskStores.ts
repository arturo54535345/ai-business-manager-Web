import { create } from 'zustand';
import type { Task } from '../types';
import type { TaskFilters } from '../services/task.service';
import { taskService } from '../services/task.service';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters; // La memoria de los filtros actuales

  // Paginación
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  // Acciones
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void; // Para cambiar los filtros y recargar
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filters: { page: 1, limit: 10 }, // Por defecto cargamos la página 1
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  fetchTasks: async (newFilters) => {
    try {
      set({ isLoading: true, error: null });
      
      // Juntamos los filtros que ya teníamos con los nuevos que nos pasen
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...newFilters };

      const response = await taskService.getTasks(mergedFilters);

      set({
        tasks: response.data,
        filters: mergedFilters, // Guardamos los nuevos filtros en memoria
        currentPage: response.pagination.paginaActual,
        totalPages: response.pagination.totalPaginas,
        totalRecords: response.pagination.totalRegistros,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar las tareas', isLoading: false });
    }
  },

  addTask: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await taskService.createTask(data);
      await get().fetchTasks(); // Recargar la lista tras crear
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear la tarea', isLoading: false });
      throw error;
    }
  },

  updateTask: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      await taskService.updateTask(id, data);
      await get().fetchTasks(); // Recargar la lista tras actualizar
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar la tarea', isLoading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await taskService.deleteTask(id);
      await get().fetchTasks(); // Recargar la lista tras borrar
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar la tarea', isLoading: false });
      throw error;
    }
  },

  // Esta función es oro puro: cambias el filtro y automáticamente busca en el backend
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchTasks();
  }
}));