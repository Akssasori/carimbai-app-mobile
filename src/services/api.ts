import axios from 'axios';
import type {
  CustomerCardsResponse,
  QRTokenResponse,
  RedeemQrTokenResponse,
  StampRequest,
  StampResponse,
  CustomerLoginRequest,
  CustomerLoginResponse,
  StaffLoginResponse,
  SwitchMerchantRequest,
  ProgramItem,
  EnrollCardResponse,
  RedeemQrRequest,
  RedeemResponse,
} from '../types';

const API_BASE_URL = 'https://carimbai-production.up.railway.app/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async loginOrRegisterCustomer(
    payload: CustomerLoginRequest,
  ): Promise<CustomerLoginResponse> {
    const response = await axios.post<CustomerLoginResponse>(
      `${this.baseUrl}/customers/login-or-register`,
      payload,
    );
    return response.data;
  }

  async loginStaff(
    email: string,
    password: string,
  ): Promise<StaffLoginResponse> {
    const response = await axios.post<StaffLoginResponse>(
      `${this.baseUrl}/auth/login`,
      {email, password},
    );
    return response.data;
  }

  async switchMerchant(
    payload: SwitchMerchantRequest,
    token: string,
  ): Promise<StaffLoginResponse> {
    const response = await axios.post<StaffLoginResponse>(
      `${this.baseUrl}/auth/switch-merchant`,
      payload,
      {headers: {Authorization: `Bearer ${token}`}},
    );
    return response.data;
  }

  async getCustomerCards(customerId: number): Promise<CustomerCardsResponse> {
    const response = await axios.get<CustomerCardsResponse>(
      `${this.baseUrl}/cards/customer/${customerId}`,
    );
    return response.data;
  }

  async getCardQR(cardId: number): Promise<QRTokenResponse> {
    const response = await axios.get<QRTokenResponse>(
      `${this.baseUrl}/qr/${cardId}`,
    );
    return response.data;
  }

  async getRedeemQR(cardId: number): Promise<RedeemQrTokenResponse> {
    const response = await axios.get<RedeemQrTokenResponse>(
      `${this.baseUrl}/cards/${cardId}/redeem-qr`,
    );
    return response.data;
  }

  async getMerchantPrograms(merchantId: number): Promise<ProgramItem[]> {
    const response = await axios.get<ProgramItem[]>(
      `${this.baseUrl}/merchants/${merchantId}/programs`,
    );
    return response.data;
  }

  async enrollCustomer(
    programId: number,
    customerId: number,
  ): Promise<EnrollCardResponse> {
    const response = await axios.post<EnrollCardResponse>(
      `${this.baseUrl}/cards`,
      {programId, customerId},
    );
    return response.data;
  }

  async applyStamp(
    stampRequest: StampRequest,
    idempotencyKey: string,
    token?: string,
    locationId?: string,
  ): Promise<StampResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (locationId) {
      headers['X-Location-Id'] = locationId;
    }
    const response = await axios.post<StampResponse>(
      `${this.baseUrl}/stamp`,
      stampRequest,
      {headers},
    );
    return response.data;
  }

  async redeemWithQr(
    request: RedeemQrRequest,
    token: string,
    cashierPin?: string,
  ): Promise<RedeemResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (request.locationId) {
      headers['X-Location-Id'] = request.locationId;
    }
    if (cashierPin) {
      headers['X-Cashier-Pin'] = cashierPin;
    }
    const response = await axios.post<RedeemResponse>(
      `${this.baseUrl}/redeem`,
      request,
      {headers},
    );
    return response.data;
  }
}

export const apiService = new ApiService();
