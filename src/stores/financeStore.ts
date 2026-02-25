import { create } from 'zustand';
import type { Finance } from '../types';
import { financeService } from '../services/finance.service';
import type { FinanceFilters, FinanceSummary } from '../services/finance.service';

interface FinanceState {
  finances: Finance[];
  summary: FinanceSummary | null; // Aquí guardamos los totales
  isLoading: boolean;
  error: string | null;
  filters: FinanceFilters;

  // Acciones que la pantalla podrá pedir
  fetchFinances: (filters?: FinanceFilters) => Promise<void>;
  fetchSummary: () => Promise<void>;
  addFinance: (data: Partial<Finance>) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  setFilters: (filters: FinanceFilters) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  finances: [],
  summary: null,
  isLoading: false,
  error: null,
  filters: {},

  // Traer el historial de movimientos
  fetchFinances: async (newFilters) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...newFilters };
      
      const data = await financeService.getFinances(mergedFilters);
      set({ finances: data, filters: mergedFilters, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar historial', isLoading: false });
    }
  },

  // Traer la calculadora de totales
  fetchSummary: async () => {
    try {
      const summary = await financeService.getSummary();
      set({ summary });
    } catch (error: any) {
      console.error("Error al cargar el resumen financiero", error);
    }
  },

  // Añadir un movimiento
  addFinance: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await financeService.createFinance(data);
      
      // EL TRUCO MAGNÍFICO: Cuando creamos uno nuevo, actualizamos la lista Y la calculadora a la vez
      await get().fetchFinances(get().filters);
      await get().fetchSummary(); 
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al registrar movimiento', isLoading: false });
      throw error;
    }
  },

  // Eliminar un movimiento
  deleteFinance: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await financeService.deleteFinance(id);
      
      // Igual aquí: si borramos un gasto, los totales deben recalcularse
      await get().fetchFinances(get().filters);
      await get().fetchSummary();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar registro', isLoading: false });
      throw error;
    }
  },

  // Cambiar los filtros de búsqueda y recargar
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchFinances();
  }
}));