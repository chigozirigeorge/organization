import { API_BASE_URL } from '@/config/api';

export interface TransferDto {
  recipient_identifier: string;  // email or username
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface DepositRequestDto {
  amount: number;
  payment_method: 'BankTransfer' | 'Card' | 'Ussd' | 'BankCode' | 'Qr';
  description: string;
  metadata?: Record<string, any>;
}

export interface WithdrawalRequestDto {
  amount: number;
  bank_account_id: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface BankAccountDto {
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
}

export class WalletService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}/wallet${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Wallet operation failed');
    }

    return response.json();
  }

  async createWallet() {
    return this.makeRequest('/create', { method: 'POST' });
  }

  async getWallet() {
    return this.makeRequest('/');
  }

  async getWalletSummary() {
    return this.makeRequest('/summary');
  }

  async initiateDeposit(data: DepositRequestDto) {
    return this.makeRequest('/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdrawFunds(data: WithdrawalRequestDto) {
    return this.makeRequest('/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async transfer(data: TransferDto) {
    return this.makeRequest('/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactionHistory(page = 1, limit = 20) {
    return this.makeRequest(`/transactions?page=${page}&limit=${limit}`);
  }

  async getTransactionByRef(reference: string) {
    return this.makeRequest(`/transaction/${reference}`);
  }

  async getBankAccounts() {
    return this.makeRequest('/bank-accounts');
  }

  async addBankAccount(data: BankAccountDto) {
    return this.makeRequest('/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyBankAccount(accountId: string) {
    return this.makeRequest(`/bank-accounts/${accountId}/verify`, {
      method: 'POST',
    });
  }

  async setPrimaryAccount(accountId: string) {
    return this.makeRequest(`/bank-accounts/${accountId}/primary`, {
      method: 'PUT',
    });
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    return this.makeRequest('/bank-accounts/resolve', {
      method: 'POST',
      body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
    });
  }

  async verifyDeposit(reference: string) {
    return this.makeRequest(`/deposit/verify?reference=${reference}`);
  }
}