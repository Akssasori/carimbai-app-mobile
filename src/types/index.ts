export interface Card {
  cardId: number;
  programId: number;
  programName: string;
  merchantName: string;
  rewardName: string;
  stampsCount: number;
  stampsNeeded: number;
  status: 'ACTIVE' | 'INACTIVE' | 'REDEEMED' | 'READY_TO_REDEEM';
  hasReward: boolean;
}

export interface CustomerCardsResponse {
  cards: Card[];
}

export interface QRTokenResponse {
  type: string;
  idRef: number;
  nonce: string;
  exp: number;
  sig: string;
}

export interface RedeemQrTokenResponse {
  type: string;
  cardId: number;
  nonce: string;
  exp: number;
  sig: string;
}

export interface StampPayload {
  cardId: number;
  nonce: string;
  exp: number;
  sig: string;
}

export interface StampRequest {
  type: string;
  payload: StampPayload;
}

export interface StampResponse {
  ok: boolean;
  cardId: number;
  stamps: number;
  needed: number;
  rewardIssued: boolean;
}

export interface RedeemQrPayload {
  cardId: number;
  nonce: string;
  exp: number;
  sig: string;
}

export interface RedeemQrRequest {
  cardId: number;
  locationId?: string;
  redeemQr: RedeemQrPayload;
}

export interface RedeemResponse {
  ok: boolean;
  rewardId?: number;
  cardId?: number;
  stampsAfter: number;
}

export interface CustomerData {
  customerId: number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerLoginRequest {
  name?: string;
  email: string;
  phone?: string;
  providerId?: string;
}

export interface CustomerLoginResponse {
  customerId: number;
  name?: string;
  email?: string;
  phone?: string;
  created: boolean;
}

export interface MerchantInfo {
  merchantId: number;
  name: string;
  role: string;
}

export interface StaffLoginResponse {
  token: string;
  staffId: number;
  role: string;
  merchantId: number;
  email: string;
  merchants: MerchantInfo[];
}

export interface StaffSession extends StaffLoginResponse {}

export interface SwitchMerchantRequest {
  merchantId: number;
}

export interface ProgramItem {
  id: number;
  name: string;
  description?: string;
  ruleTotalStamps: number;
  rewardName: string;
  category?: string;
  imageUrl?: string;
}

export interface EnrollCardResponse {
  id: number;
  programId: number;
  customerId: number;
  stampsCount: number;
  status: string;
}

export interface QRCodeData {
  type: string;
  idRef?: number;
  cardId?: number;
  customerId?: number;
  nonce?: string;
  exp?: number;
  sig?: string;
}
