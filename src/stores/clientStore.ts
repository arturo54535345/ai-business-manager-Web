import { create } from 'zustand';
import type { Client } from '../types';
import { clientService } from '../services/client.service';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  fetchClients: (page?: number) => Promise<void>;
  addClient: (data: Partial<Client>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  fetchClients: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      // 👈 CORRECCIÓN 1: La función se llamaba getClients en plural
      const response = await clientService.getClient(page);
      
      set({ 
        clients: response.data, 
        currentPage: response.pagination.paginaActual,
        totalPages: response.pagination.totalPaginas,
        // 👈 CORRECCIÓN 2: Añadida la "s" a totalRegistros para que no falle la tabla
        totalRecords: response.pagination.totalRegistro,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar clientes', isLoading: false });
    }
  },

  addClient: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.createClient(data);
      await get().fetchClients(get().currentPage);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear cliente', isLoading: false });
      throw error;
    }
  },

  updateClient: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.updateClient(id, data);
      await get().fetchClients(get().currentPage);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar cliente', isLoading: false });
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.deleteClient(id);
      await get().fetchClients(get().currentPage);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar cliente', isLoading: false });
      throw error;
    }
  }
}));