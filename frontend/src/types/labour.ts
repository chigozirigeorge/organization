// types/labour.ts
export interface WorkerProfile {
  id: string;
  user_id: string;
  category: string;
  experience_years: number;
  description: string;
  hourly_rate: number;
  daily_rate: number;
  location_state: string;
  location_city: string;
  skills: string[];
  rating?: number;
  total_reviews?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  completed_jobs?: number;
  is_available?: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location_state: string;
  location_city: string;
  location_address?: string;
  estimated_duration_days: number;
  partial_payment_allowed: boolean;
  partial_payment_percentage?: number;
  deadline?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  employer: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface WorkerUserResponse {
  id: string;
  name: string;
  email: string;
  username?: string;
  trust_score?: number;
  verified?: boolean;
}

export interface JobApplication {
  // id: string;
  job_id: string;
  worker_id: string;
  worker?: WorkerUserResponse | null;
  worker_profile?: WorkerProfileApplicationResponse | null;
  proposed_rate: number;
  estimated_completion: number;
  cover_letter: string;
  status: string;
  created_at: string;
  job: Job;
}

export interface WorkerUserResponse {
  id: string;
  name: string;
  email: string;
}

export interface WorkerProfileApplicationResponse {
  id?: string;
  user_id?: string;
  category?: string;
  experience_years?: number;
  description?: string;
  hourly_rate?: number;
  daily_rate?: number;
  location_state?: string;
  location_city?: string;
  skills?: string[];
  rating?: number;
}

// Helper functions with proper null handling
export const extractWorkerName = (
  worker: WorkerUserResponse | null | undefined, 
  workerProfile: WorkerProfileApplicationResponse | null | undefined,
  workerId: string
): string => {
  if (worker?.name) return worker.name;
  if (workerProfile?.user_id) return `Worker ${workerProfile.user_id.substring(0, 8)}`;
  return `Worker ${workerId.substring(0, 8)}`;
};

export const extractWorkerEmail = (worker: WorkerUserResponse | null | undefined): string => {
  return worker?.email || 'Email not available';
};

export const extractWorkerExperience = (workerProfile: WorkerProfileApplicationResponse | null | undefined): number => {
  return workerProfile?.experience_years || 0;
};

export const extractWorkerCategory = (workerProfile: WorkerProfileApplicationResponse | null | undefined): string => {
  return workerProfile?.category || 'General Labor';
};

export const extractWorkerLocation = (workerProfile: WorkerProfileApplicationResponse | null | undefined): string => {
  if (!workerProfile?.location_city || !workerProfile?.location_state) {
    return 'Location not specified';
  }
  return `${workerProfile.location_city}, ${workerProfile.location_state}`;
};

export const extractWorkerDescription = (workerProfile: WorkerProfileApplicationResponse | null | undefined): string => {
  return workerProfile?.description || 'No description provided. Contact worker for more details about their experience and qualifications.';
};

export const extractWorkerHourlyRate = (workerProfile: WorkerProfileApplicationResponse | null | undefined): number => {
  return workerProfile?.hourly_rate || 0;
};

export const extractWorkerDailyRate = (workerProfile: WorkerProfileApplicationResponse | null | undefined): number => {
  return workerProfile?.daily_rate || 0;
};

export const extractWorkerSkills = (workerProfile: WorkerProfileApplicationResponse | null | undefined): string[] => {
  return workerProfile?.skills || [];
};

export interface Contract {
  id: string;
  job_id: string;
  worker_id: string;
  employer_id: string;
  agreed_rate: number;
  agreed_timeline: number;
  terms: string;
  status: 'draft' | 'pending' | 'signed' | 'active' | 'completed' | 'cancelled';
  employer_signed: boolean;
  worker_signed: boolean;
  created_at: string;
  job: Job;
  worker: {
    id: string;
    user: {
      name: string;
      username: string;
    };
    profile: WorkerProfile;
  };
}

export interface JobProgress {
  id: string;
  job_id: string;
  progress_percentage: number;
  description: string;
  image_urls: string[];
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  job_id: string;
  created_by: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: 'open' | 'under_review' | 'resolved';
  resolution?: string;
  decision?: 'full_payment' | 'partial_payment' | 'no_payment';
  payment_percentage?: number;
  created_at: string;
}

export interface Escrow {
  id: string;
  job_id: string;
  amount: number;
  released_amount: number;
  status: 'funded' | 'partial_released' | 'fully_released' | 'refunded';
  created_at: string;
}

export interface JobWithApplications extends Job {
  applications_count?: number;
}