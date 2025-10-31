// utils/workerUtils.ts
import { WorkerProfile, WorkerUserResponse } from '../types/labour';

export interface CompleteWorkerData {
  user: WorkerUserResponse;
  profile: WorkerProfile;
  portfolio: any[];
  reviews: any[];
}

// utils/workerUtils.ts - Add new function
export const getWorkerProfileByWorkerId = async (workerId: string, token: string): Promise<WorkerProfile | null> => {
  try {
    console.log('🔍 [getWorkerProfileByWorkerId] Fetching worker profile for worker ID:', workerId);
    
    // First, we need to get the worker profile to extract the user_id
    // You'll need to create a backend endpoint for this, but for now let's assume one exists
    const response = await fetch(`https://verinest.up.railway.app/api/labour/worker/${workerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ [getWorkerProfileByWorkerId] Worker profile found:', data);
      return data.data || data;
    } else {
      console.error('❌ [getWorkerProfileByWorkerId] Failed to fetch worker profile:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ [getWorkerProfileByWorkerId] Error:', error);
    return null;
  }
};

// // Updated fetchWorkerProfile to handle both user_id and worker_id
// export const fetchWorkerProfile = async (identifier: string, token: string, isWorkerId: boolean = false): Promise<CompleteWorkerData | null> => {
//   try {
//     console.log('🔍 [fetchWorkerProfile] Fetching with identifier:', identifier, 'isWorkerId:', isWorkerId);
    
//     let url: string;
    
//     if (isWorkerId) {
//       // If it's a worker_id, we need to get the user_id first
//       const workerProfile = await getWorkerProfileByWorkerId(identifier, token);
//       if (!workerProfile || !workerProfile.user_id) {
//         console.error('❌ [fetchWorkerProfile] Could not get user_id from worker profile');
//         return null;
//       }
//       console.log('🔄 [fetchWorkerProfile] Got user_id from worker profile:', workerProfile.user_id);
//       url = `https://verinest.up.railway.app/api/labour/workers/${workerProfile.user_id}`;
//     } else {
//       // If it's already a user_id, use it directly
//       url = `https://verinest.up.railway.app/api/labour/workers/${identifier}`;
//     }

//     const response = await fetch(url, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log('✅ [fetchWorkerProfile] Successfully fetched worker details');
//       return data.data || data;
//     } else {
//       console.error('❌ [fetchWorkerProfile] Failed to fetch worker details:', response.status);
//       return null;
//     }
//   } catch (error) {
//     console.error('❌ [fetchWorkerProfile] Error:', error);
//     return null;
//   }
// };

export const fetchWorkerProfile = async (workerId: string, token: string) => {
  try {
    console.log('🔍 [fetchWorkerProfile] Starting for worker ID:', workerId);
    
    // Directly use the smart endpoint
    const workerData = await getWorkerProfileByWorkerId(workerId, token);
    
    if (!workerData) {
      console.error('❌ [fetchWorkerProfile] No worker data returned');
      throw new Error('No worker data found');
    }
    
    console.log('✅ [fetchWorkerProfile] Successfully fetched worker data:', workerData);
    return workerData;
    
  } catch (error) {
    console.error('❌ [fetchWorkerProfile] Error fetching worker profile:', error);
    throw error;
  }
};