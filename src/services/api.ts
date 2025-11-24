import axios from 'axios';
import type {
  CustomerCardsResponse,
  QRTokenResponse,
  StampRequest,
  StampResponse,
} from '../types';

// Altere para o IP da sua máquina na rede local
// Exemplo: http://192.168.1.100:1234/api
const API_BASE_URL = 'https://carimbai-production.up.railway.app/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getCustomerCards(customerId: number): Promise<CustomerCardsResponse> {
    try {
      const response = await axios.get<CustomerCardsResponse>(
        `${this.baseUrl}/cards/customer/${customerId}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Erro ao buscar cartões: ${error.response?.statusText || error.message}`,
        );
      }
      throw error;
    }
  }

  async getCardQR(cardId: number): Promise<QRTokenResponse> {
    try {
      const response = await axios.get<QRTokenResponse>(
        `${this.baseUrl}/cards/${cardId}/qr`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Erro ao gerar QR Code: ${error.response?.statusText || error.message}`,
        );
      }
      throw error;
    }
  }

  async applyStamp(
    stampRequest: StampRequest,
    idempotencyKey: string,
  ): Promise<StampResponse> {
    try {
      const response = await axios.post<StampResponse>(
        `${this.baseUrl}/stamp`,
        stampRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
            Accept: 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorText = error.response?.data || error.message;
        throw new Error(
          `Erro ao aplicar carimbo: ${error.response?.status} - ${errorText}`,
        );
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();