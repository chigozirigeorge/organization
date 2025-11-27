// utils/vendorApi.ts
// API calls for vendor marketplace features

import { apiClient } from './api';
import { 
  VendorService, 
  VendorProfile, 
  CreateServiceDto, 
  CreateOrderDto,
  ServiceOrder 
} from '../types/vendor.types';

const API_BASE = 'https://api.verinest.xyz/api';

export const vendorApi = {
  // Vendor Profile Management
  async createVendorProfile(data: {
    business_name: string;
    description?: string;
    location_state: string;
    location_city: string;
  }): Promise<VendorProfile> {
    const response = await apiClient.post('/vendor/profile', data);
    return response.data;
  },

  async getVendorProfile(): Promise<VendorProfile> {
    const response = await apiClient.get('/vendor/profile');
    return response.data;
  },

  async updateVendorProfile(data: Partial<VendorProfile>): Promise<VendorProfile> {
    const response = await apiClient.put('/vendor/profile', data);
    return response.data;
  },

  // Service Management
  async createService(data: CreateServiceDto): Promise<VendorService> {
    const response = await apiClient.post('/vendor/services', data);
    return response.data;
  },

  async getMyServices(status?: string): Promise<VendorService[]> {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/vendor/services${params}`);
    return response.data;
  },

  async getService(serviceId: string): Promise<VendorService> {
    const response = await apiClient.get(`/vendor/services/${serviceId}`);
    return response.data;
  },

  async updateService(serviceId: string, data: Partial<VendorService>): Promise<VendorService> {
    const response = await apiClient.put(`/vendor/services/${serviceId}`, data);
    return response.data;
  },

  async deleteService(serviceId: string): Promise<void> {
    await apiClient.delete(`/vendor/services/${serviceId}`);
  },

  async updateServiceStatus(serviceId: string, status: string): Promise<VendorService> {
    const response = await apiClient.put(`/vendor/services/${serviceId}/status`, { status });
    return response.data;
  },

  // Public Service Discovery
  async searchServices(params: {
    category?: string;
    location_state?: string;
    location_city?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<VendorService[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`/services?${queryParams.toString()}`);
    return response.data;
  },

  async getRecommendedServices(limit: number = 20): Promise<VendorService[]> {
    const response = await apiClient.get(`/services/recommended?limit=${limit}`);
    return response.data;
  },

  async viewService(serviceId: string): Promise<VendorService> {
    const response = await apiClient.get(`/services/${serviceId}`);
    return response.data;
  },

  // Orders
  async createOrder(data: CreateOrderDto): Promise<ServiceOrder> {
    const response = await apiClient.post(`/services/${data.service_id}/purchase`, data);
    return response.data;
  },

  async getMyPurchases(status?: string): Promise<ServiceOrder[]> {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/orders/my-purchases${params}`);
    return response.data;
  },

  async getVendorOrders(status?: string): Promise<ServiceOrder[]> {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/vendor/orders${params}`);
    return response.data;
  },

  async getOrderDetails(orderId: string): Promise<ServiceOrder> {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  async confirmDelivery(orderId: string, data: {
    rating?: number;
    review_comment?: string;
  }): Promise<ServiceOrder> {
    const response = await apiClient.post(`/orders/${orderId}/complete`, data);
    return response.data;
  },

  // Analytics
  async getVendorAnalytics(): Promise<any> {
    const response = await apiClient.get('/vendor/analytics');
    return response.data;
  },

  // Inquiries
  async createInquiry(serviceId: string, message: string): Promise<any> {
    const response = await apiClient.post(`/services/${serviceId}/inquiry`, { message });
    return response.data;
  },

  async getVendorInquiries(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/vendor/inquiries${params}`);
    return response.data;
  },
};