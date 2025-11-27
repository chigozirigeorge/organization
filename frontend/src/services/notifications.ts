// services/notifications.ts
import { apiClient } from '../utils/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
  action_url?: string;
  action_text?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  job_updates: boolean;
  messages: boolean;
  reviews: boolean;
  payments: boolean;
}

export class NotificationService {
  // Get notifications with pagination and filtering
  static async getNotifications(params: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
    type?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.unread_only) query.set('unread_only', 'true');
    if (params.type) query.set('type', params.type);

    const response = await apiClient.get(`/notifications?${query.toString()}`);
    return response.data || response;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data || response;
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    const response = await apiClient.put('/notifications/read-all');
    return response.data || response;
  }

  // Delete notification
  static async deleteNotification(notificationId: string) {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data || response;
  }

  // Get unread count
  static async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data || response;
  }

  // Get notification preferences
  static async getPreferences() {
    const response = await apiClient.get('/notifications/preferences');
    return response.data || response;
  }

  // Update notification preferences
  static async updatePreferences(preferences: Partial<NotificationPreferences>) {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data || response;
  }

  // Subscribe to push notifications (web push API)
  static async subscribeToPush(subscription: PushSubscription) {
    const response = await apiClient.post('/notifications/subscribe', {
      subscription,
    });
    return response.data || response;
  }

  // Unsubscribe from push notifications
  static async unsubscribeFromPush() {
    const response = await apiClient.post('/notifications/unsubscribe');
    return response.data || response;
  }

  // Send test notification (for development)
  static async sendTestNotification() {
    const response = await apiClient.post('/notifications/test');
    return response.data || response;
  }
}

// Export individual functions for convenience
export const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getPreferences,
  updatePreferences,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
} = NotificationService;
