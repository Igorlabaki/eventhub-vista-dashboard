import { Organization } from "./organization";
import { User } from "@/components/ui/user-list";
import { UserPermission } from "./userPermissions";

export type UserOrganization = {
  id: string;
  userId: string;
  organizationId: string;
  joinedAt: Date;
  user: User;
  organization: Organization;
  userPermissions: UserPermission[];
};

export interface CreateUserOrganizationDTO {
  userOrganizationId: string;
  role: string;
  venueId: string;
  permissions: string[];
}

export interface UpdateUserOrganizationDTO {
  organizationId: string;
  userId: string;
}

export interface UserOrganizationByIdResponse {
  success: true,
  message: string,
  data: UserOrganization,
  count: number,
  type: string
}

export interface UserOrganizationListResponse {
  success: true,
  message: string,
  data: {
    userOrganizationByOrganizationList
    : UserOrganization[]
  },
  count: number,
  type: string
}
export interface UserOrganizationListByUserResponse {
  success: true,
  message: string,
  data: {
    userOrganizationList
    : UserOrganization[]
  },
  count: number,
  type: string
}

export interface UserOrganizationCreateResponse {
  success: true,
  message: string,
  data: UserOrganization,
  count: number,
  type: string
}

export interface UserOrganizationDeleteResponse {
  success: true,
  message: string,
  data: UserOrganization,
  count: number,
  type: string
}

export interface UserOrganizationUpdateResponse {
  success: true,
  message: string,
  data: UserOrganization,
  count: number,
  type: string
}
