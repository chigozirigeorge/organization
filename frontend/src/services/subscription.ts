// src/services/subscription.ts
import { apiClient } from "../utils/api";
import type { SubscriptionStatusResponse, InitiatePremiumResponse } from "../types/subscription";

// apiClient manages Authorization via stored token. Do not pass headers here.
export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  return await apiClient.get("/users/subscription/premium");
}

export async function initiatePremiumPayment(): Promise<InitiatePremiumResponse> {
  return await apiClient.post("/users/subscription/premium/initiate");
}

export async function subscribeToPremium(payment_reference: string): Promise<any> {
  return await apiClient.post("/users/subscription/premium", { payment_reference });
}