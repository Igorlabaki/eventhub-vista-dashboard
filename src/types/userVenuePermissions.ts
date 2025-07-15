import { UserOrganization } from "./userOrganization";
import { Venue } from "./venue";

export type UserVenuePermission = {
  id: string;
  userOrganizationId: string;
  permissions: string;
  venueId?: string | null;
  // Relacionamentos (ajuste os tipos conforme seus models)
  userOrganization: UserOrganization; 
  venue?: Venue;    
};

export interface CreateUserVenuePermissionDTO {
  userOrganizationId: string;
  permissions: string[];
  venueId: string;
}
export interface GetUserVenuePermissionDTO {
  organizationId: string;
  venueId: string;
  userId: string;
}

export interface UpdateUserVenuePermissionDTO {
  userVenuePermissionId: string;
  permissions?: string[];
  venueId?: string;
}

export interface UserVenuePermissionByIdResponse {
  success: true,
  message: string,
  data: UserVenuePermission,
  count: number,
  type: string
}

export interface UserVenuePermissionListResponse {
  success: true,
  message: string,
  data: {
    userVenuePermissionList: UserVenuePermission[]
  },
  count: number,
  type: string
}

export interface UserVenuePermissionCreateResponse {
  success: true,
  message: string,
  data: UserVenuePermission,
  count: number,
  type: string
}

export interface UserVenuePermissionDeleteResponse {
  success: true,
  message: string,
  data: UserVenuePermission,
  count: number,
  type: string
}

export interface UserVenuePermissionUpdateResponse {
  success: true,
  message: string,
  data: UserVenuePermission,
  count: number,
  type: string
}
