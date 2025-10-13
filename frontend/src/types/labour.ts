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

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  proposed_rate: number;
  estimated_completion: number;
  cover_letter: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  job?: Job; 
  worker: {
    id: string;
    user: {
      name: string;
      username: string;
    };
    profile: WorkerProfile;
  };
}

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