// utils/api.ts
import { toast } from 'sonner';

interface ApiHeaders {
  'Content-Type': string;
  'Authorization'?: string;
  [key: string]: string | undefined;
}

class ApiClient {
  private baseURL = 'https://verinest.up.railway.app/api';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Create properly typed headers object
    const headers: ApiHeaders = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge with any existing headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: headers as HeadersInit,
      });

      // Handle token expiration
      if (response.status === 401) {
        this.clearToken();
        if (!window.location.pathname.includes('/login')) {
          toast.error('Your session has expired. Please log in again.');
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Request failed with status ${response.status}`;
        
        // Don't show toast for authentication errors (handled above)
        if (response.status !== 401) {
          toast.error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      // Don't re-throw authentication errors (they're handled above)
      if (error.message !== 'Authentication required' && !error.message.includes('Failed to fetch')) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export const apiClient = new ApiClient();