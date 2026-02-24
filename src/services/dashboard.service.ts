import {api} from './api';

//datos exactos que quiero que me devuelva
export interface DashboardStats {
    netProfit: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    moneyAtStake: number;
    activeClients: number;
    totalClients: number;
    pendingTasks: number;
    completedTasks: number;
}

//funcion que buscara la bandeja de datos
export const dashboardService = {
    async getStats(): Promise<DashboardStats>{
        const response = await api.get('/dashboard');
        return response.data.data.kpis;
    }
};