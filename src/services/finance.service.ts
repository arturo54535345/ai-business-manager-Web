import {api} from './api';
import type {Finance} from '../types';

//datos exactos que quiero que me devuelva
export interface FinanceSummary{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
}
//opciones para buscar en el historial 
export interface FinanceFilters{
    startDate?: string;
    endDate?: string;
    type?: 'ingreso'|'gasto';
}
export const financeService = {
    //el cliente pueda pedir una lista de movimientos 
    async getFinances(filters: FinanceFilters = {}): Promise<Finance[]>{
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.type) params.append('type', filters.type);

        const response = await api.get<Finance[]>(`/finance?${params.toString()}`);
        return response.data;
    },
    //pedir los calculos totales 
    async getSummary(): Promise<FinanceSummary>{
        const response = await api.get<FinanceSummary>('/finance/summary');
        return response.data;
    },
    //añadir ingreso nuevo o gasto 
    async createFinance(data: Partial<Finance>): Promise<Finance>{
        const response = await api.post<Finance>('/finance',data);
        return response.data;
    },
    //borrar un movimiento si por si el cliente se equivoca
    async deleteFinance(id: string): Promise<void>{
        await api.delete(`/finance/${id}`);
    }
};