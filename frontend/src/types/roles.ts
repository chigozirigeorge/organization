export type AllowedRole = "worker" | "employer" | "vendor";

export interface AvailableRolesResponse {
  status: "success";
  data: {
    current_role: AllowedRole;
    available_roles: {
      role: AllowedRole;
      name: string;
      description: string;
      requires_verification: boolean;
    }[];
  };
}

export interface RoleUpgradeRequest {
  target_user_id: string;
  new_role: AllowedRole;
}