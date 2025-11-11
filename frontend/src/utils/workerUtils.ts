// utils/workerUtils.ts - COMPLETE FIXED VERSION
export interface WorkerUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar_url?: string;
  trust_score: number;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkerProfile {
  id?: string;
  profile_id?: string;
  user_id?: string;
  category: string;
  experience_years: number;
  description: string;
  hourly_rate: number;
  daily_rate: number;
  location_state: string;
  location_city: string;
  is_available: boolean;
  rating: number;
  completed_jobs: number;
  skills: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CompleteWorkerData {
  user: WorkerUser;
  profile: WorkerProfile;
  portfolio: any[];
  reviews: any[];
  applications?: any[];
}

export const fetchCompleteWorkerData = async (workerId: string, token: string): Promise<CompleteWorkerData | null> => {
  try {
    console.log('🔍 [fetchCompleteWorkerData] Fetching worker data for ID:', workerId);
    
    const response = await fetch(`https://verinest.up.railway.app/api/labour/workers/${workerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [fetchCompleteWorkerData] API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch worker data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [fetchCompleteWorkerData] Raw API response:', data);

    // Handle different response structures
    let workerData = data.data || data;
    
    if (!workerData) {
      console.error('❌ [fetchCompleteWorkerData] No worker data found in response');
      return null;
    }

    // Normalize user data
    const userData = workerData.user || workerData;
    const user: WorkerUser = {
      id: userData.id,
      name: userData.name || 'Unknown Worker',
      email: userData.email || '',
      username: userData.username || 'worker',
      avatar_url: userData.avatar_url,
      trust_score: userData.trust_score || 0,
      verified: userData.verified || false,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };

    // Normalize profile data
    const profileData = workerData.profile || {};
    const profile: WorkerProfile = {
      id: profileData.id || profileData.profile_id,
      profile_id: profileData.profile_id || profileData.id,
      user_id: profileData.user_id || workerId,
      category: profileData.category || 'Other',
      experience_years: profileData.experience_years || 0,
      description: profileData.description || 'No description available.',
      hourly_rate: profileData.hourly_rate || 0,
      daily_rate: profileData.daily_rate || 0,
      location_state: profileData.location_state || '',
      location_city: profileData.location_city || '',
      is_available: profileData.is_available !== undefined ? profileData.is_available : true,
      rating: profileData.rating || 0,
      completed_jobs: profileData.completed_jobs || 0,
      skills: profileData.skills || [],
      created_at: profileData.created_at,
      updated_at: profileData.updated_at
    };

    // Normalize portfolio data structure
    let portfolio = workerData.portfolio || [];
    if (portfolio && typeof portfolio === 'object') {
      if ('data' in portfolio) {
        portfolio = portfolio.data;
      } else if ('portfolio' in portfolio) {
        portfolio = portfolio.portfolio;
      }
    }
    
    // Ensure portfolio is an array
    if (!Array.isArray(portfolio)) {
      portfolio = [];
    }

    // Normalize reviews data structure
    let reviews = workerData.reviews || [];
    if (reviews && typeof reviews === 'object') {
      if ('data' in reviews) {
        reviews = reviews.data;
      } else if ('reviews' in reviews) {
        reviews = reviews.reviews;
      }
    }
    
    // Ensure reviews is an array
    if (!Array.isArray(reviews)) {
      reviews = [];
    }

    const normalizedData: CompleteWorkerData = {
      user,
      profile,
      portfolio,
      reviews,
      applications: workerData.applications || []
    };

    console.log('✅ [fetchCompleteWorkerData] Normalized worker data:', normalizedData);
    return normalizedData;

  } catch (error) {
    console.error('❌ [fetchCompleteWorkerData] Error:', error);
    return null;
  }
};

// Alias for backward compatibility
export const fetchWorkerData = fetchCompleteWorkerData;

// // utils/workerUtils.ts - UPDATED
// import { apiClient } from './api';

// export interface CompleteWorkerData {
//   user: any;
//   profile: any;
//   portfolio: any[];
//   reviews: any[];
// }

// // Get worker profile by user_id (this works correctly)
// export const getWorkerProfileByUserId = async (userId: string): Promise<CompleteWorkerData | null> => {
//   try {
//     console.log('🔍 [getWorkerProfileByUserId] Fetching worker profile for user_id:', userId);
    
//     // Use the smart endpoint with user_id (this works correctly)
//     const response = await apiClient.get(`/labour/workers/${userId}`);
    
//     console.log('✅ [getWorkerProfileByUserId] Worker profile API response:', response);
    
//     // Handle the API response structure
//     if (response.data) {
//       console.log('✅ [getWorkerProfileByUserId] Found worker data in response.data');
//       return response.data;
//     } else {
//       console.error('❌ [getWorkerProfileByUserId] Unexpected response structure:', response);
//       return null;
//     }
//   } catch (error: any) {
//     console.error('❌ [getWorkerProfileByUserId] Failed to fetch worker profile:', error);
//     return null;
//   }
// };

// // Combined function to get complete worker data using user_id
// export const fetchCompleteWorkerData = async (userId: string): Promise<CompleteWorkerData | null> => {
//   try {
//     console.log('🔍 [fetchCompleteWorkerData] Fetching complete worker data for user_id:', userId);
    
//     // Get the worker profile using user_id (this works correctly)
//     const workerData = await getWorkerProfileByUserId(userId);
    
//     if (!workerData) {
//       console.error('❌ [fetchCompleteWorkerData] No worker data found for user_id:', userId);
//       return null;
//     }
    
//     console.log('✅ [fetchCompleteWorkerData] Successfully fetched complete worker data:', {
//       userId: workerData.user?.id,
//       profileId: workerData.profile?.id,
//       portfolioItems: workerData.portfolio?.length,
//       reviews: workerData.reviews?.length
//     });
    
//     return workerData;
    
//   } catch (error) {
//     console.error('❌ [fetchCompleteWorkerData] Error fetching worker data:', error);
//     throw error;
//   }
// };