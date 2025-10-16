// hooks/useVerificationFlow.ts (Enhanced)
import { useAuth, VERIFICATION_STEPS } from '../contexts/AuthContext';

export const useVerificationFlow = () => {
  const auth = useAuth();

  const shouldShowVerification = (): boolean => {
    if (!auth.user) return false;
    
    return !(
      auth.user.email_verified && 
      auth.user.kyc_verified === 'verified' && 
      auth.user.role && 
      auth.user.wallet_created && 
      auth.user.bank_account_linked && 
      auth.user.profile_completed
    );
  };

  const getNextVerificationStep = (): string => {
    if (!auth.user) return VERIFICATION_STEPS.TERMS;

    const progress = auth.getVerificationProgress();
    
    // If we have progress, continue from there
    if (progress.currentStep !== VERIFICATION_STEPS.TERMS) {
      return progress.currentStep;
    }

    // Otherwise determine next step based on user status
    if (!auth.user.email_verified) {
      return VERIFICATION_STEPS.TERMS;
    } else if (!auth.user.kyc_verified || auth.user.kyc_verified === 'unverified') {
      return VERIFICATION_STEPS.DOCUMENT;
    } else if (!auth.user.role) {
      return VERIFICATION_STEPS.ROLE;
    } else if (!auth.user.wallet_created) {
      return VERIFICATION_STEPS.WALLET;
    } else if (!auth.user.bank_account_linked) {
      return VERIFICATION_STEPS.BANK;
    } else if (!auth.user.profile_completed) {
      return VERIFICATION_STEPS.PROFILE;
    } else {
      return VERIFICATION_STEPS.COMPLETE;
    }
  };

  const startOrContinueVerification = (): void => {
    if (shouldShowVerification()) {
      const nextStep = getNextVerificationStep();
      const progress = auth.getVerificationProgress();
      
      if (progress.currentStep === VERIFICATION_STEPS.TERMS && nextStep !== VERIFICATION_STEPS.TERMS) {
        // Update progress to skip completed steps
        auth.completeVerificationStep(VERIFICATION_STEPS.TERMS);
      }
      
      auth.startVerificationFlow();
    } else {
      // Redirect to dashboard if verification is complete
      window.location.href = '/dashboard';
    }
  };

  const getVerificationBenefits = () => {
    return [
      'Apply for jobs as a worker',
      'Post jobs as an employer',
      'Withdraw funds from your wallet',
      'Build trust with other users',
      'Access premium features'
    ];
  };

  return {
    shouldShowVerification,
    getNextVerificationStep,
    startOrContinueVerification,
    getVerificationBenefits,
    verificationSteps: VERIFICATION_STEPS
  };
};