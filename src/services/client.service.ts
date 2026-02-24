import {api} from './api';
import type {Client} from '../types';

//aqui la web devuelve la info
export interface ClientsResponse {
    data: Client[];
    pagination: {
        totalRegistro: number;
        paginaActual: number;
        totalPaginas: number;
    };
}

//llamadas al backend
export const clientService = {
    //pido que vengan los clientes del usuasrio
    async getClient(page=1, limit=10): Promise<ClientsResponse>{
        const response = await api.get<ClientsResponse>(`/clients?page=${page}&limit=${limit}`);
        return response.data;
    },
    //crear un cliente nuevo
    async createClient(data: Partial<Client>): Promise<Client>{
        const response = await api.post<Client>('/clients', data);
        return response.data;
    },
    //actualizar cliente
    async updateClient(id: string, data: Partial<Client>): Promise<Client>{
        const response = await api.patch<Client>(`/clients/${id}`, data);
        return response.data;
    },
    //eliminar cliente 
    async deleteClient(id: string): Promise<void>{
        await api.delete(`/clients/${id}`);
    },
};