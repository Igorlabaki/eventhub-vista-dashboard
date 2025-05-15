import { UserOrganization } from "./userOrganization";
import { Venue } from "./venue";

export type UserPermission = {
  id: string;
  userOrganizationId: string;
  permissions: string;
  venueId?: string | null;
  role: string;
  // Relacionamentos (ajuste os tipos conforme seus models)
  userOrganization: UserOrganization; 
  venue?: Venue;    
};

export interface CreateUserPermissionDTO {
  userOrganizationId: string;
  role: string;
  venueId: string;
  permissions: string[]; 
  userId: string;
  organizationId: string;
}

export interface UpdateUserPermissionDTO {
  userPermissionId: string;
  role?: string;
  venueId?: string;
  permissions?: string[];
}

export interface UserPermissionByIdResponse {
  success: true,
  message: string,
  data: UserPermission,
  count: number,
  type: string
}

export interface UserPermissionListResponse {
  success: true,
  message: string,
  data: {
    userPermissionList: UserPermission[]
  },
  count: number,
  type: string
}

export interface UserPermissionCreateResponse {
  success: true,
  message: string,
  data: UserPermission,
  count: number,
  type: string
}

export interface UserPermissionDeleteResponse {
  success: true,
  message: string,
  data: UserPermission,
  count: number,
  type: string
}

export interface UserPermissionUpdateResponse {
  success: true,
  message: string,
  data: UserPermission,
  count: number,
  type: string
}
