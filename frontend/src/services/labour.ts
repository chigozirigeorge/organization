// src/services/labour.ts
import { apiClient } from '../utils/api';

// Typed interfaces (reuse types from src/types/labour.ts where possible)
import type {
  Job,
  JobApplication,
  Contract
} from '../types/labour';

/**
 * Fetch job details by id
 */
export async function fetchJobDetails(jobId: string) {
  const res = await apiClient.get(`/labour/jobs/${jobId}`);
  return res.data || res;
}

/**
 * Fetch contract for a job
 */
export async function fetchJobContract(jobId: string) {
  const res = await apiClient.get(`/labour/jobs/${jobId}/contract`);
  return res.data || res;
}

/**
 * Get employer dashboard (posted jobs, stats)
 */
export async function getEmployerDashboard() {
  const res = await apiClient.get('/labour/employer/dashboard');
  return res.data || res;
}

/**
 * Get worker dashboard (applications, contracts, stats)
 */
export async function getWorkerDashboard() {
  const res = await apiClient.get('/labour/worker/dashboard');
  return res.data || res;
}

/**
 * Assign a worker to a job (returns assignment result)
 */
export async function assignWorkerToJob(jobId: string, workerId: string) {
  const res = await apiClient.put(`/labour/jobs/${jobId}/assign`, { worker_id: workerId });
  return res.data || res;
}

/**
 * Get applications for a job (employer view)
 */
export async function getJobApplications(jobId: string) {
  const res = await apiClient.get(`/labour/jobs/${jobId}/applications`);
  return res.data || res;
}

/**
 * Review (accept/reject) an application
 * Expected payload: { status: 'accepted' | 'rejected', reason?: string }
 */
export async function reviewApplication(applicationId: string, payload: { status: 'accepted' | 'rejected'; reason?: string }) {
  const res = await apiClient.put(`/labour/applications/${applicationId}/review`, payload);
  return res.data || res;
}

/**
 * Convenience wrapper to reject an application with an optional reason
 */
export async function rejectApplication(applicationId: string, reason?: string) {
  return await reviewApplication(applicationId, { status: 'rejected', reason });
}

/**
 * Create a job
 */
export async function createJob(payload: any) {
  const res = await apiClient.post('/labour/jobs', payload);
  return res.data || res;
}

/**
 * Apply to a job (worker)
 */
export async function applyToJob(jobId: string, payload: { proposed_rate: number; estimated_completion: number; cover_letter: string }) {
  const res = await apiClient.post(`/labour/jobs/${jobId}/applications`, payload);
  return res.data || res;
}

/**
 * Create a contract for a job
 */
export async function createContractForJob(jobId: string, payload: any) {
  const res = await apiClient.post(`/labour/jobs/${jobId}/contract`, payload);
  return res.data || res;
}

/**
 * List jobs with optional query params
 */
export async function listJobs(params: { page?: number; limit?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);

  const res = await apiClient.get(`/labour/jobs?${query.toString()}`);
  return res.data || res;
}

/**
 * Get a personalized feed for the user.
 * Backend expected endpoint: /labour/feed?role={role}&page={page}&limit={limit}
 */
export async function getFeed(params: { role?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await apiClient.get(`/labour/feed?${query.toString()}`);
  return res.data || res;
}

/**
 * Sign a contract (worker or employer)
 */
export async function signContract(contractId: string, payload?: any) {
  // Prefer PUT (server expects PUT for signing). If payload provided (otp/request_otp), send it; otherwise call PUT without a body.
  const endpoint = `/labour/contracts/${contractId}/sign`;

  // Helper to format and rethrow ApiError bodies so UI can inspect for OTP requirements
  const rethrowWithBody = (err: any) => {
    const status = err?.status || null;
    const body = err?.body || null;
    if (body) throw new Error(JSON.stringify({ status, body }));
    throw err;
  };

  try {
    // If payload is explicitly provided (otp/request_otp), include it in the PUT body.
    // Otherwise send an explicit empty JSON object so the server's JSON extractor
    // (axum Json<T>) can parse the request body (avoids EOF parse errors).
    const bodyToSend = payload !== undefined ? payload : {};
    const res = await apiClient.put(endpoint, bodyToSend);
    console.debug('[labour.signContract] used PUT for', contractId);
    return res.data || res;
  } catch (err: any) {
    // If server says method not allowed for PUT, fallback to POST/PATCH attempts.
    const status = err?.status || null;
    const body = err?.body || null;
    console.warn('[labour.signContract] PUT failed', { contractId, status, body, message: err?.message });

    if (status === 405 || String(err?.message || '').toLowerCase().includes('method not allowed')) {
      try {
        // Try POST only if payload is provided (posting an otp/request_otp makes sense)
        if (payload !== undefined) {
          const resPost = await apiClient.post(endpoint, payload);
          console.debug('[labour.signContract] fallback used POST for', contractId);
          return resPost.data || resPost;
        }

        // Try PATCH as last resort without body
        const resPatch = await apiClient.patch(endpoint);
        console.debug('[labour.signContract] fallback used PATCH for', contractId);
        return resPatch.data || resPatch;
      } catch (fallbackErr: any) {
        console.error('[labour.signContract] fallback methods failed for', contractId, fallbackErr);
        rethrowWithBody(fallbackErr);
      }
    }

    // If PUT returned a 400 with a body (e.g., server indicates OTP required), surface that to UI
    rethrowWithBody(err);
  }
}

/**
 * Get contracts for the authenticated user
 */
export async function getContracts() {
  const res = await apiClient.get('/labour/contracts');
  return res.data || res;
}

/**
 * Get active contracts (convenience)
 */
export async function getActiveContracts() {
  const res = await apiClient.get('/labour/contracts?status=active');
  return res.data?.contracts || res.data || res;
}

/**
 * Fetch progress for a job
 */
export async function fetchJobProgress(jobId: string) {
  const res = await apiClient.get(`/labour/jobs/${jobId}/progress`);
  return res.data?.progress || res.data || res;
}

/**
 * Submit a progress update for a job
 */
export async function submitJobProgress(jobId: string, payload: { progress_percentage: number; description: string; image_urls?: string[] }) {
  const res = await apiClient.post(`/labour/jobs/${jobId}/progress`, payload);
  return res.data || res;
}

/**
 * Mark job as complete
 */
export async function completeJobById(jobId: string) {
  const res = await apiClient.put(`/labour/jobs/${jobId}/complete`);
  return res.data || res;
}

/**n* Worker portfolio endpoints */
export async function getWorkerPortfolio() {
  const res = await apiClient.get('/labour/worker/portfolio');
  return res.data || res;
}

export async function addWorkerPortfolioItem(payload: any) {
  const res = await apiClient.post('/labour/worker/portfolio', payload);
  return res.data || res;
}

export async function deleteWorkerPortfolioItem(itemId: string) {
  const res = await apiClient.delete(`/labour/worker/portfolio/${itemId}`);
  return res.data || res;
}

/**
 * Fetch a contract by its ID
 */
export async function getContract(contractId: string) {
  const res = await apiClient.get(`/labour/contracts/${contractId}`);
  return res.data || res;
}

/**
 * Try to fetch a worker/profile by several possible endpoints.
 * Backend sometimes exposes either a worker profile id or a user id — try variants.
 */
export async function getWorkerByAnyId(id: string) {
  const attempts = [
    `/users/${id}`,
    `/labour/workers/${id}`,
    `/labour/workers/profile/${id}`,
  ];

  for (const endpoint of attempts) {
    try {
      const res = await apiClient.get(endpoint);
      const data = res.data || res;
      if (data) return data;
    } catch (err) {
      // try next
      continue;
    }
  }

  console.warn('[labour.getWorkerByAnyId] could not resolve worker for', id);
  return null;
}

export default {
  fetchJobDetails,
  fetchJobContract,
  getEmployerDashboard,
  getWorkerDashboard,
  assignWorkerToJob,
  getJobApplications,
  createJob,
  applyToJob,
  createContractForJob,
  listJobs,
  signContract,
  getFeed,
};
