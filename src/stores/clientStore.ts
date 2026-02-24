import { create } from 'zustand';
import type { Client } from '../types';
import { clientService } from '../services/client.service';

// 1. ESTRUCTURA DEL ARCHIVERO: Todo lo que vamos a guardar en memoria
interface ClientState {
  clients: Client[];          // La lista de clientes
  isLoading: boolean;         // ¿Está cargando?
  error: string | null;       // ¿Hubo algún error?
  
  // Datos de la Paginación
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  // Las acciones que la pantalla podrá pedirle al archivero
  fetchClients: (page?: number) => Promise<void>;
  addClient: (data: Partial<Client>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

// 2. LA LÓGICA DEL ARCHIVERO
export const useClientStore = create<ClientState>((set, get) => ({
  // Valores iniciales por defecto (Archivero vacío)
  clients: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  // Acción: Ir a buscar la lista de clientes
  fetchClients: async (page = 1) => {
    try {
      set({ isLoading: true, error: null }); // Encendemos la rueda de carga
      const response = await clientService.getClient(page);
      
      // Guardamos todo lo que nos devolvió el servidor en la memoria
      set({ 
        clients: response.data, 
        currentPage: response.pagination.paginaActual,
        totalPages: response.pagination.totalPaginas,
        totalRecords: response.pagination.totalRegistro,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar clientes', isLoading: false });
    }
  },

  // Acción: Añadir un cliente
  addClient: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.createClient(data);
      // TRUCO: Después de crear uno nuevo, le decimos al archivero que vuelva a buscar la lista
      // para que el nuevo cliente aparezca mágicamente en la pantalla.
      await get().fetchClients(get().currentPage);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear cliente', isLoading: false });
      throw error;
    }
  },

  // Acción: Actualizar un cliente
  updateClient: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.updateClient(id, data);
      await get().fetchClients(get().currentPage); // Recargamos la lista
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar cliente', isLoading: false });
      throw error;
    }
  },

  // Acción: Borrar un cliente
  deleteClient: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.deleteClient(id);
      await get().fetchClients(get().currentPage); // Recargamos la lista
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar cliente', isLoading: false });
      throw error;
    }
  }
}));