import { api } from './api';
import type { Task } from '../types';

// 1. EL TRADUCTOR DE RESPUESTAS
export interface TasksResponse {
  data: Task[];
  pagination: {
    totalRegistros: number;
    paginaActual: number;
    totalPaginas: number;
  };
}

// 2. EL MOLDE DE FILTROS: Le decimos a TypeScript qué cosas podemos usar para filtrar
export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  clientId?: string; // Para ver solo las tareas de un cliente específico
}

export const taskService = {
  // Pedir tareas (ahora le enviamos la caja de filtros entera)
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    // URLSearchParams es una herramienta nativa que convierte un objeto {status: 'pending'} en una URL real: "?status=pending"
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.clientId) params.append('clientId', filters.clientId);

    const response = await api.get<TasksResponse>(`/tasks?${params.toString()}`);
    return response.data;
  },

  // Crear tarea
  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  // Actualizar tarea (moverla a completada, cambiar título, etc)
  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  // Eliminar tarea
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
};