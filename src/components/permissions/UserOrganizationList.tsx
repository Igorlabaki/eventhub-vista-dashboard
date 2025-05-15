import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserOrganization } from "@/types/userOrganization";
import { UserOrganizationListSkeleton } from "./UserOrganizationListSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { FilterList } from "@/components/filterList";
import { UserPermission } from "@/types/userPermissions";
import { Settings } from "lucide-react";


interface UserOrganizationListProps {
  userOrganizations: UserOrganization[];
  onUserClick: (userOrganization: UserOrganization) => void;
  isLoading?: boolean;
  onCreateClick?: () => void;
}

export function UserOrganizationList({
  userOrganizations,
  onUserClick,
  isLoading = false,
  onCreateClick
}: UserOrganizationListProps) {
  if (isLoading) {
    return <UserOrganizationListSkeleton />;
  }

  if (!userOrganizations.length) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Adicione usuários para gerenciar suas permissões"
        actionText="Adicionar Usuário"
        onAction={onCreateClick || (() => {})}
      />
    );
  }

  return (
    <FilterList
      items={userOrganizations}
      filterBy={(userOrganization, query) => 
        userOrganization?.user?.username?.toLowerCase().includes(query.toLowerCase()) ||
        userOrganization?.user?.email?.toLowerCase().includes(query.toLowerCase())
      }
      placeholder="Buscar usuários..."
    >
      {(filteredUsers) => (
        <Table className="bg-white rounded-md shadow-lg">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((userOrganization) => (
              <TableRow 
                key={userOrganization.id}
                className="hover:bg-gray-50"
              >
                <TableCell className="font-medium">
                  {userOrganization.user.username}
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => onUserClick(userOrganization)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </FilterList>
  );
} 