import { Notification, NotificationResponse, MarkReadRequest } from '@/types/notification';
import { API_BASE_URL } from '@/config/api';

export class NotificationService {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`🔔 Making request to: ${url}`);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        console.log(`🔔 Response status:`, response.status);
            
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Request failed:', {
                status: response.status,
                url,
                errorText
            });
            throw new Error(`Request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`🔔 Response data:`, data);
        return data;
    }

    async getNotifications(page = 1, limit = 20): Promise<NotificationResponse> {
        return this.request<NotificationResponse>(`/notifications?page=${page}&limit=${limit}`);
    }

    async getUnreadCount(): Promise<number> {
        const response = await this.request<{ unread_count: number }>(
            '/notifications/unread-count'
        );
        return response.unread_count;
    }

    async markAsRead(notificationIds: string[]): Promise<void> {
        const payload: MarkReadRequest = { notification_ids: notificationIds };
        await this.request('/notifications/read', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async markAllAsRead(): Promise<void> {
        await this.request('/notifications/read-all', {
            method: 'POST',
        });
    }
}