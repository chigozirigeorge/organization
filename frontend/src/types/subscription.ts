// src/types/subscription.ts
export interface SubscriptionStatusResponse {
  status: "success";
  data: {
    tier: "basic" | "premium";
    status: "active" | "expired";
    expires_at: string;
    benefits?: string[];
  };
}

export interface InitiatePremiumResponse {
  status: "success";
  message: string;
  data: {
    reference: string;
    amount: number;
    description: string;
    requires_pin: boolean;
  };
}