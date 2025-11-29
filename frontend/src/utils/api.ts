// utils/api.ts
import { toast } from 'sonner';

interface ApiHeaders {
  'Content-Type': string;
  'Authorization'?: string;
  [key: string]: string | undefined;
}

class ApiError extends Error {
  status: number;
  body: any;
  constructor(message: string, status: number, body: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

class ApiClient {
  private baseURL = 'https://api.verinest.xyz/api';
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
        const contentType = response.headers.get('content-type') || '';
        let errorData: any = {};
        if (contentType.includes('application/json')) {
          errorData = await response.json().catch(() => ({}));
        } else {
          const text = await response.text().catch(() => '');
          errorData = { message: text };
        }

        const errorMessage = errorData.message || `Request failed with status ${response.status}`;

        // Don't show toast for authentication errors (handled above)
        if (response.status !== 401) {
          toast.error(errorMessage);
        }

        throw new ApiError(errorMessage, response.status, errorData);
      }

      // Parse body safely and normalize response shape.
      const contentType = response.headers.get('content-type') || '';
      let body: any = {};
      if (contentType.includes('application/json')) {
        try {
          body = await response.json();
        } catch (e) {
          body = {};
        }
      } else {
        try {
          const text = await response.text();
          body = { message: text };
        } catch (e) {
          body = {};
        }
      }

      // Normalize: prefer { data: ... } wrapper but fall back to raw body
      const normalized = body && typeof body === 'object' && 'data' in body ? body.data : body;
      console.log('API response', { url, status: response.status, body: normalized });
      return normalized;
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
      // Allow passing a pre-serialized JSON string to avoid double-stringify
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  async postFormData(endpoint: string, data: FormData | Record<string, any>) {
    // Handle both FormData and regular objects
    const isFormData = data instanceof FormData;
    
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data',
      } : {
        'Content-Type': 'application/json',
      },
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: typeof data === 'string' ? data : JSON.stringify(data),
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