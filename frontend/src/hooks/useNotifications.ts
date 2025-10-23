import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/utils/notification';
import { Notification } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();
    const { toast } = useToast();

    const notificationService = new NotificationService(token || '');

    const fetchNotifications = async () => {
        if (!token) return;
        
        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getNotifications();
            if (response && Array.isArray(response.notifications)) {
                setNotifications(response.notifications);
            }
            console.log('Notifications fetched:', response); // Debug log
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
            setError(message);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            console.error('Error fetching notifications:', err); // Debug log
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        if (!token) return;
        
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
            console.log('Unread count:', count); // Debug log
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const markAsRead = async (notificationId: string) => {
        if (!token) return;
        
        try {
            await notificationService.markAsRead([notificationId]);
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to mark notification as read';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const markAllAsRead = async () => {
        if (!token) return;
        
        try {
            await notificationService.markAllAsRead();
            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({
                    ...notification,
                    is_read: true,
                }))
            );
            setUnreadCount(0);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to mark all as read';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
            fetchUnreadCount();

            // Poll for updates every minute
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [token]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
    };
}