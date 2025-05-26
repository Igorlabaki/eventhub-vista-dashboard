import { Edit, Trash2, Pencil } from "lucide-react";
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
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

interface UserOrganizationListProps {
  userOrganizations: UserOrganization[];
  onUserClick: (userOrganization: UserOrganization) => void;
  isLoading?: boolean;
  onCreateClick?: () => void;
  onDeleteUserOrganization?: (userOrganization: UserOrganization) => void;
}

export function UserOrganizationList({
  userOrganizations,
  onUserClick,
  isLoading = false,
  onCreateClick,
  onDeleteUserOrganization
}: UserOrganizationListProps) {
  const [userOrgToDelete, setUserOrgToDelete] = useState<UserOrganization | null>(null);

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
    <>
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
                  className="hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => onUserClick(userOrganization)}
                >
                  <TableCell className="font-medium">
                    {userOrganization.user.username}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); onUserClick(userOrganization); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar permissões"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setUserOrgToDelete(userOrganization); }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remover usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </FilterList>
      <ConfirmDeleteDialog
        open={!!userOrgToDelete}
        onOpenChange={(open) => !open && setUserOrgToDelete(null)}
        onConfirm={async () => {
          if (userOrgToDelete && onDeleteUserOrganization) {
            onDeleteUserOrganization(userOrgToDelete);
            setUserOrgToDelete(null);
          }
        }}
        entityName={userOrgToDelete?.user?.username || ""}
        entityType="usuário"
      />
    </>
  );
} 