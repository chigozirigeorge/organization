// src/services/roles.ts
import { apiClient } from "../utils/api";
import type { AvailableRolesResponse, RoleUpgradeRequest } from "../types/roles";

// apiClient will use the stored token; don't pass it in here.
export async function getAvailableRoles(): Promise<AvailableRolesResponse> {
  return await apiClient.get("/users/role/available");
}

export async function upgradeUserRole(req: RoleUpgradeRequest): Promise<any> {
  return await apiClient.put("/users/role/upgrade", req);
}