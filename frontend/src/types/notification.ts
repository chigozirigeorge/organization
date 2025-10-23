export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    link?: string;
    created_at: string;
    metadata?: Record<string, any>;
}

export enum NotificationType {
    JOB_APPLICATION = 'job_application',
    JOB_ASSIGNED = 'job_assigned',
    JOB_COMPLETED = 'job_completed',
    PAYMENT_RECEIVED = 'payment_received',
    PAYMENT_RELEASED = 'payment_released',
    DISPUTE_CREATED = 'dispute_created',
    DISPUTE_RESOLVED = 'dispute_resolved',
    PROFILE_VERIFIED = 'profile_verified',
    CONTRACT_SIGNED = 'contract_signed'
}

export interface NotificationResponse {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface MarkReadRequest {
    notification_ids?: string[];
}