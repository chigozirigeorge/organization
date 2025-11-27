// services/userProfile.ts
import { apiClient } from '../utils/api';
import { API_BASE_URL } from '../config/api';

export interface UserProfileDto {
  phone_number?: string;
  lga?: string;
  nearest_landmark?: string;
  nationality?: string;
  dob?: string;
  address?: string;
}

export interface UserFilterDto {
  role?: string;
  location_state?: string;
  location_city?: string;
  verification_status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export class UserProfileService {
  // Get user profile
  static async getProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data || response;
  }

  // Update user profile
  static async updateProfile(data: UserProfileDto) {
    const response = await apiClient.put('/users/profile', data);
    return response.data || response;
  }

  // Filter/search users
  static async filterUsers(params: UserFilterDto) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.set(key, value.toString());
      }
    });

    const response = await apiClient.get(`/users/filter?${query.toString()}`);
    return response.data || response;
  }

  // Get user by ID (public)
  static async getUserById(userId: string) {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data || response;
  }

  // Update user avatar
  static async updateAvatar(avatarUrl: string) {
    const response = await apiClient.put('/users/avatar', { avatar_url: avatarUrl });
    return response.data || response;
  }

  // Update user preferences
  static async updatePreferences(preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    language?: string;
    timezone?: string;
  }) {
    const response = await apiClient.put('/users/preferences', preferences);
    return response.data || response;
  }

  // Get user preferences
  static async getPreferences() {
    const response = await apiClient.get('/users/preferences');
    return response.data || response;
  }

  // Delete user account
  static async deleteAccount(password: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(error.message || 'Failed to delete account');
    }
    
    return response.json();
  }

  // Get user statistics
  static async getUserStats() {
    const response = await apiClient.get('/users/stats');
    return response.data || response;
  }
}

// Export individual functions for convenience
export const {
  getProfile,
  updateProfile,
  filterUsers,
  getUserById,
  updateAvatar,
  updatePreferences,
  getPreferences,
  deleteAccount,
  getUserStats,
} = UserProfileService;
