import { API_BASE_URL } from '@/config/api';

export interface TransferDto {
  recipient_identifier: string;  // email or username
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export class WalletService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getWallet() {
    const response = await fetch(`${API_BASE_URL}/wallet`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }

    return response.json();
  }

  async transfer(data: TransferDto) {
    const response = await fetch(`${API_BASE_URL}/wallet/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Transfer failed');
    }

    return response.json();
  }

  async getTransactionHistory(page = 1, limit = 20) {
    const response = await fetch(
      `${API_BASE_URL}/wallet/transactions?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transaction history');
    }

    return response.json();
  }

  // Add more wallet-related methods as needed
}