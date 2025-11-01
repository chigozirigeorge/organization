// // utils/workerUtils.ts
// import { WorkerProfile, WorkerUserResponse } from '../types/labour';

// export interface CompleteWorkerData {
//   user: WorkerUserResponse;
//   profile: WorkerProfile;
//   portfolio: any[];
//   reviews: any[];
// }

// // utils/workerUtils.ts - Add new function
// export const getWorkerProfileByWorkerId = async (workerId: string, token: string): Promise<WorkerProfile | null> => {
//   try {
//     console.log('🔍 [getWorkerProfileByWorkerId] Fetching worker profile for worker ID:', workerId);
    
//     // First, we need to get the worker profile to extract the user_id
//     // You'll need to create a backend endpoint for this, but for now let's assume one exists
//     const response = await fetch(`https://verinest.up.railway.app/api/labour/worker/${workerId}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log('✅ [getWorkerProfileByWorkerId] Worker profile found:', data);
//       return data.data || data;
//     } else {
//       console.error('❌ [getWorkerProfileByWorkerId] Failed to fetch worker profile:', response.status);
//       return null;
//     }
//   } catch (error) {
//     console.error('❌ [getWorkerProfileByWorkerId] Error:', error);
//     return null;
//   }
// };

// // // Updated fetchWorkerProfile to handle both user_id and worker_id
// // export const fetchWorkerProfile = async (identifier: string, token: string, isWorkerId: boolean = false): Promise<CompleteWorkerData | null> => {
// //   try {
// //     console.log('🔍 [fetchWorkerProfile] Fetching with identifier:', identifier, 'isWorkerId:', isWorkerId);
    
// //     let url: string;
    
// //     if (isWorkerId) {
// //       // If it's a worker_id, we need to get the user_id first
// //       const workerProfile = await getWorkerProfileByWorkerId(identifier, token);
// //       if (!workerProfile || !workerProfile.user_id) {
// //         console.error('❌ [fetchWorkerProfile] Could not get user_id from worker profile');
// //         return null;
// //       }
// //       console.log('🔄 [fetchWorkerProfile] Got user_id from worker profile:', workerProfile.user_id);
// //       url = `https://verinest.up.railway.app/api/labour/workers/${workerProfile.user_id}`;
// //     } else {
// //       // If it's already a user_id, use it directly
// //       url = `https://verinest.up.railway.app/api/labour/workers/${identifier}`;
// //     }

// //     const response = await fetch(url, {
// //       headers: {
// //         'Authorization': `Bearer ${token}`,
// //         'Content-Type': 'application/json',
// //       },
// //     });

// //     if (response.ok) {
// //       const data = await response.json();
// //       console.log('✅ [fetchWorkerProfile] Successfully fetched worker details');
// //       return data.data || data;
// //     } else {
// //       console.error('❌ [fetchWorkerProfile] Failed to fetch worker details:', response.status);
// //       return null;
// //     }
// //   } catch (error) {
// //     console.error('❌ [fetchWorkerProfile] Error:', error);
// //     return null;
// //   }
// // };

// export const fetchWorkerProfile = async (workerId: string, token: string) => {
//   try {
//     console.log('🔍 [fetchWorkerProfile] Starting for worker ID:', workerId);
    
//     // Directly use the smart endpoint
//     const workerData = await getWorkerProfileByWorkerId(workerId, token);
    
//     if (!workerData) {
//       console.error('❌ [fetchWorkerProfile] No worker data returned');
//       throw new Error('No worker data found');
//     }
    
//     console.log('✅ [fetchWorkerProfile] Successfully fetched worker data:', workerData);
//     return workerData;
    
//   } catch (error) {
//     console.error('❌ [fetchWorkerProfile] Error fetching worker profile:', error);
//     throw error;
//   }
// };

// utils/workerUtils.ts - UPDATED
import { apiClient } from './api';

export interface CompleteWorkerData {
  user: any;
  profile: any;
  portfolio: any[];
  reviews: any[];
}

// Get worker profile by user_id (this works correctly)
export const getWorkerProfileByUserId = async (userId: string): Promise<CompleteWorkerData | null> => {
  try {
    console.log('🔍 [getWorkerProfileByUserId] Fetching worker profile for user_id:', userId);
    
    // Use the smart endpoint with user_id (this works correctly)
    const response = await apiClient.get(`/labour/workers/${userId}`);
    
    console.log('✅ [getWorkerProfileByUserId] Worker profile API response:', response);
    
    // Handle the API response structure
    if (response.data) {
      console.log('✅ [getWorkerProfileByUserId] Found worker data in response.data');
      return response.data;
    } else {
      console.error('❌ [getWorkerProfileByUserId] Unexpected response structure:', response);
      return null;
    }
  } catch (error: any) {
    console.error('❌ [getWorkerProfileByUserId] Failed to fetch worker profile:', error);
    return null;
  }
};

// Combined function to get complete worker data using user_id
export const fetchCompleteWorkerData = async (userId: string): Promise<CompleteWorkerData | null> => {
  try {
    console.log('🔍 [fetchCompleteWorkerData] Fetching complete worker data for user_id:', userId);
    
    // Get the worker profile using user_id (this works correctly)
    const workerData = await getWorkerProfileByUserId(userId);
    
    if (!workerData) {
      console.error('❌ [fetchCompleteWorkerData] No worker data found for user_id:', userId);
      return null;
    }
    
    console.log('✅ [fetchCompleteWorkerData] Successfully fetched complete worker data:', {
      userId: workerData.user?.id,
      profileId: workerData.profile?.id,
      portfolioItems: workerData.portfolio?.length,
      reviews: workerData.reviews?.length
    });
    
    return workerData;
    
  } catch (error) {
    console.error('❌ [fetchCompleteWorkerData] Error fetching worker data:', error);
    throw error;
  }
};