import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterList } from "@/components/filterList";
import { Organization } from "@/types";
import { UserOrganizationPermission } from "@/types/userOrganizationPermission";

interface OrganizationPermissionsListProps {
  organization: Organization;
  onOrganizationClick: (
    organization: Organization,
    organizationPermission: {
      id: string;
      permissions: string[];
      role: string;
    }
  ) => void;
  userOrganizationPermission: UserOrganizationPermission;
}

export function OrganizationPermissionsList({
  organization,
  onOrganizationClick,
  userOrganizationPermission,
}: OrganizationPermissionsListProps) {
  const isAdmin = userOrganizationPermission.role === "admin";
  return (
    <div className="">
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
            onClick={() =>
              onOrganizationClick(organization, userOrganizationPermission)
            }
          >
            <TableCell className="font-medium">{organization.name}</TableCell>
            <TableCell className="text-center">
              {userOrganizationPermission.role ? (
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
}
