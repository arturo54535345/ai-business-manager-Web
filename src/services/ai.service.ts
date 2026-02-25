import { api } from './api';

export const aiService = {
  // Solo necesitamos una función: enviar texto y recibir texto
  async chat(message: string): Promise<string> {
    const response = await api.post('/ai/chat', { message });
    return response.data.response;
  }
};