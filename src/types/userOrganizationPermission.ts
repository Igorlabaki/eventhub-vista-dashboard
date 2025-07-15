import { UserOrganization } from "./userOrganization";

export type UserOrganizationPermission = {
  id: string;
  organizationId: string;
  userOrganizationId?: string;
  userId: string;
  permissions: string[];
  userOrganization?: UserOrganization;
};

export interface CreateUserOrganizationPermissionDTO {
  organizationId: string;
  userOrganizationId?: string;
  userId: string;
  permissions: string[];
}

export interface UpdateUserOrganizationPermissionDTO {
  userOrganizationPermissionId: string;
  permissions: string[];
}

export interface GetUserOrganizationPermissionByIdDTO {
  userOrganizationPermissionId: string;
}

export interface DeleteUserOrganizationPermissionDTO {
  userOrganizationPermissionId: string;
}

export interface UserOrganizationPermissionByIdResponse {
  success: true,
  message: string,
  data: UserOrganizationPermission,
  count: number,
  type: string
}

export interface UserOrganizationPermissionListResponse {
  success: true,
  message: string,
  data: {
    userOrganizationPermissionList: UserOrganizationPermission[]
  },
  count: number,
  type: string
}

export interface UserOrganizationPermissionCreateResponse {
  success: true,
  message: string,
  data: UserOrganizationPermission,
  count: number,
  type: string
}

export interface UserOrganizationPermissionDeleteResponse {
  success: true,
  message: string,
  data: UserOrganizationPermission,
  count: number,
  type: string
}

export interface UserOrganizationPermissionUpdateResponse {
  success: true,
  message: string,
  data: UserOrganizationPermission,
  count: number,
  type: string
} 