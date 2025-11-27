// services/publicWorker.ts
import { apiClient } from '../utils/api';

export interface PublicWorkerProfile {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  username: string;
  category: string;
  experience_years: number;
  description: string;
  hourly_rate?: number;
  daily_rate?: number;
  location_state: string;
  location_city: string;
  is_available: boolean;
  rating: number;
  completed_jobs: number;
  verification_status: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  worker_profile_id: string;
  title: string;
  description: string;
  images: string[];
  completion_date: string;
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  comment: string;
  quality_score?: number;
  timeliness_score?: number;
  communication_score?: number;
  created_at: string;
}

export interface PublicWorkerPortfolioResponse {
  profile: PublicWorkerProfile;
  portfolio: PortfolioItem[];
  reviews: Review[];
  stats: {
    total_jobs: number;
    completion_rate: number;
    average_rating: number;
    response_time: number;
  };
}

export class PublicWorkerService {
  // Get public worker profile by username
  static async getWorkerProfileByUsername(username: string) {
    const response = await apiClient.get(`/labour/profile/${username}`);
    return response.data || response;
  }

  // Get public worker portfolio by username
  static async getWorkerPortfolioByUsername(username: string) {
    const response = await apiClient.get(`/labour/profile/${username}/portfolio`);
    return response.data || response;
  }

  // Get complete public worker data (profile + portfolio + reviews)
  static async getCompleteWorkerProfile(username: string): Promise<PublicWorkerPortfolioResponse> {
    const [profileResponse, portfolioResponse] = await Promise.all([
      this.getWorkerProfileByUsername(username),
      this.getWorkerPortfolioByUsername(username),
    ]);

    return {
      profile: profileResponse.profile || profileResponse,
      portfolio: portfolioResponse.portfolio || portfolioResponse.items || [],
      reviews: portfolioResponse.reviews || [],
      stats: portfolioResponse.stats || {
        total_jobs: 0,
        completion_rate: 0,
        average_rating: 0,
        response_time: 0,
      },
    };
  }

  // Check if username exists
  static async checkUsernameExists(username: string) {
    try {
      const response = await apiClient.get(`/labour/profile/${username}/exists`);
      return response.data?.exists || false;
    } catch (error) {
      return false;
    }
  }

  // Search workers by username pattern
  static async searchByUsername(query: string, limit = 10) {
    const response = await apiClient.get(`/labour/workers/search?q=${query}&limit=${limit}`);
    return response.data || response;
  }

  // Get similar workers based on category and location
  static async getSimilarWorkers(username: string, limit = 6) {
    const response = await apiClient.get(`/labour/workers/${username}/similar?limit=${limit}`);
    return response.data || response;
  }

  // Report worker profile
  static async reportWorker(username: string, reason: string, description: string) {
    const response = await apiClient.post(`/labour/workers/${username}/report`, {
      reason,
      description,
    });
    return response.data || response;
  }
}

// Export individual functions for convenience
export const {
  getWorkerProfileByUsername,
  getWorkerPortfolioByUsername,
  getCompleteWorkerProfile,
  checkUsernameExists,
  searchByUsername,
  getSimilarWorkers,
  reportWorker,
} = PublicWorkerService;
