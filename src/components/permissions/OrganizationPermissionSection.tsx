import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserOrganization } from "@/types/userOrganization";
import React from "react";
import { Organization } from "@/types/organization";
import { UserOrganizationPermission } from "@/types/userOrganizationPermission";

interface OrganizationPermissionSectionProps {
  selectedUserOrganization: UserOrganization;
  userOrganizationPermission: UserOrganizationPermission;
  organization: Organization;
  handleGoBack: () => void;
  handleOrganizationClick: () => void;
}

export const OrganizationPermissionSection: React.FC<
  OrganizationPermissionSectionProps
> = ({
  selectedUserOrganization,
  userOrganizationPermission,
  organization,
  handleGoBack,
  handleOrganizationClick,
}) => {
  const isAdmin =
    userOrganizationPermission && userOrganizationPermission.role === "admin";
  return (
    <div className="bg-white rounded-md shadow-lg overflow-hidden">
      <div className="bg-eventhub-primary text-white px-2  font-semibold py-2">
        <h2>Organização</h2>
      </div>
      <Table className=" shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Espaço</TableHead>
            <TableHead className="w-[100px]">Permissão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            key={organization.id}
            className="cursor-pointer hover:bg-gray-50"
            onClick={handleOrganizationClick}
          >
            <TableCell className="font-medium">{organization?.name}</TableCell>
            <TableCell className="text-center">
              {userOrganizationPermission && userOrganizationPermission.role ? (
                <span
                  className={cn(
                    "text-xs font-medium rounded-full px-2 py-1",
                    isAdmin
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              ) : (
                <span className="text-xs text-gray-500">---</span>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
