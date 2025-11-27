// services/verification.ts
import { apiClient } from '../utils/api';

export interface OTPRequestDto {
  purpose: 'phone_verification' | 'email_verification' | 'transaction';
  identifier: string; // phone number or email
}

export interface OTPVerifyDto {
  otp: string;
  purpose: 'phone_verification' | 'email_verification' | 'transaction';
  identifier: string;
}

export interface NINVerificationDto {
  nin_number: string;
  full_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
}

export interface DocumentVerificationDto {
  verification_type: 'NationalId' | 'DriverLicense' | 'Passport';
  document_number: string;
  document_url: string;
  selfie_url: string;
}

export interface VerificationReviewDto {
  status: 'Approved' | 'Rejected';
  review_notes: string;
  admin_id: string;
}

export class VerificationService {
  // OTP Management
  static async sendOTP(purpose: 'phone_verification' | 'email_verification' | 'transaction', identifier: string) {
    const response = await apiClient.post('/verification/otp/send', {
      purpose,
      identifier,
    });
    return response.data || response;
  }

  static async verifyOTP(otp: string, purpose: 'phone_verification' | 'email_verification' | 'transaction', identifier: string) {
    const response = await apiClient.post('/verification/otp/verify', {
      otp,
      purpose,
      identifier,
    });
    return response.data || response;
  }

  // Document Verification
  static async getDocuments() {
    const response = await apiClient.get('/verification/documents');
    return response.data || response;
  }

  static async getVerificationStatus() {
    const response = await apiClient.get('/verification/status');
    return response.data || response;
  }

  static async getCompleteVerificationStatus() {
    const response = await apiClient.get('/verification/complete-status');
    return response.data || response;
  }

  // NIN Verification
  static async submitNINVerification(data: NINVerificationDto) {
    const response = await apiClient.post('/verification/nin', data);
    return response.data || response;
  }

  // Document Verification
  static async submitDocumentVerification(data: DocumentVerificationDto) {
    const response = await apiClient.post('/verification/document', data);
    return response.data || response;
  }

  // Admin Verification (for admins/verifiers)
  static async getPendingVerifications() {
    const response = await apiClient.get('/verification/admin/pending');
    return response.data || response;
  }

  static async reviewVerification(verificationId: string, status: 'Approved' | 'Rejected', reviewNotes: string, adminId: string) {
    const response = await apiClient.put(`/verification/admin/${verificationId}/review`, {
      status,
      review_notes: reviewNotes,
      admin_id: adminId,
    });
    return response.data || response;
  }
}

// Export individual functions for convenience
export const {
  sendOTP,
  verifyOTP,
  getDocuments,
  getVerificationStatus,
  getCompleteVerificationStatus,
  submitNINVerification,
  submitDocumentVerification,
  getPendingVerifications,
  reviewVerification,
} = VerificationService;
