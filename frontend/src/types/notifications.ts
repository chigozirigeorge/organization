export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  link?: string;
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
  CONTRACT_SIGNED = 'contract_signed',
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  job_alerts: boolean;
  payment_alerts: boolean;
  dispute_alerts: boolean;
}