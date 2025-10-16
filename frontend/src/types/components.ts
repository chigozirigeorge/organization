// types/components.ts
export interface DocumentVerificationProps {
  onComplete: (data: any) => void;
  onBack?: () => void;
}

export interface WalletSetupProps {
  onComplete: () => void;
  compact?: boolean;
}

export interface BankAccountSetupProps {
  onComplete: () => void;
  compact?: boolean;
}

export interface WorkerProfileSetupProps {
  onComplete: () => void;
  compact?: boolean;
}

export interface CreateJobProps {
  onComplete: () => void;
  compact?: boolean;
}