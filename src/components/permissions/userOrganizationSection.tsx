import { PageHeader } from "@/components/PageHeader";
import { UserOrganizationList } from "@/components/permissions/UserOrganizationList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";
import { UserOrganization } from "@/types/userOrganization";
import { User } from "@/components/ui/user-list";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import { DashboardLayout } from "../DashboardLayout";
import AccessDenied from "../accessDenied";

interface UserOrganizationSectionProps {
  addUserDialogOpen: boolean;
  setAddUserDialogOpen: (open: boolean) => void;
  userOrganizations: UserOrganization[];
  isLoadingUsers: boolean;
  handleUserClick: (userOrganization: UserOrganization) => void;
  handleDeleteUserOrganization: (userOrganization: UserOrganization) => void;
  searchEmail: string;
  setSearchEmail: (email: string) => void;
  isUserLoading: boolean;
  searchedUser: User | null;
  selectedUser: User | null;
  setView: React.Dispatch<
    React.SetStateAction<
      "venues" | "users" | "venue-permissions" | "organization-permissions"
    >
  >;
  organizationId: string | undefined;
  setTempUserOganization: (userOrganization: UserOrganization) => void;
}

export const UserOrganizationSection: React.FC<
  UserOrganizationSectionProps
> = ({
  addUserDialogOpen,
  setAddUserDialogOpen,
  userOrganizations,
  isLoadingUsers,
  handleUserClick,
  handleDeleteUserOrganization,
  searchEmail,
  setSearchEmail,
  isUserLoading,
  searchedUser,
  selectedUser,
  organizationId,
  setTempUserOganization,
  setView,
}) => {
  const { currentUserOrganizationPermission } =
    useUserOrganizationPermissionStore();

  const hasEditPermission = () => {
    if (!currentUserOrganizationPermission?.permissions) return false;
    return currentUserOrganizationPermission.permissions.includes(
      "EDIT_ORG_PERMISSIONS"
    );
  };

  return (
    <div
      className={
        "transition-all duration-300 ease-in-out opacity-100 scale-100 w-full"
      }
    >
      {hasEditPermission() && (
        <PageHeader
          isFormOpen={addUserDialogOpen}
          count={userOrganizations?.length || 0}
          onCreateClick={() => setAddUserDialogOpen(true)}
          createButtonText="Adicionar Usuário"
        />
      )}

      <UserOrganizationList
        hasEditPermission={hasEditPermission()}
        userOrganizations={userOrganizations || []}
        onUserClick={handleUserClick}
        isLoading={isLoadingUsers}
        onCreateClick={() => setAddUserDialogOpen(true)}
        onDeleteUserOrganization={handleDeleteUserOrganization}
      />
    
      {addUserDialogOpen &&  (
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent className="w-[90%] md:w-[50%] rounded-md">
            <DialogHeader>
              <DialogTitle>Buscar usuário por e-mail</DialogTitle>
            </DialogHeader>
            <Input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Digite o e-mail do usuário"
              className="mb-2"
            />
            {isUserLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500 transition-opacity duration-300 opacity-100">
                <Loader2 className="animate-spin" size={18} />
                Buscando...
              </div>
            )}
            {searchedUser && !selectedUser && (
              <div className="border rounded p-3 flex flex-col gap-2 mt-2 bg-gray-50 transition-all duration-300 animate-fade-in">
                <div>
                  <strong>{searchedUser.username}</strong> ({searchedUser.email}
                  )
                </div>
                <Button
                  onClick={() => {
                    setSearchEmail("");
                    setAddUserDialogOpen(false);
                    setTempUserOganization({
                      id: "",
                      user: {
                        id: searchedUser.id,
                        name: searchedUser.username,
                        username: searchedUser.username,
                        email: searchedUser.email,
                      },
                      userOrganizationPermission: {
                        id: "",
                        permissions: [],
                        role: "",
                        organizationId: organizationId || "",
                        userId: searchedUser.id,
                      },
                      userVenuePermissions: [],
                      userId: searchedUser.id,
                      organizationId: organizationId || "",
                      joinedAt: new Date(),
                      organization: {
                        id: organizationId || "",
                        name: "",
                        createdAt: "",
                        venues: [],
                        owners: [],
                        clauses: [],
                        contracts: [],
                        attachments: [],
                        whatsappNumber: "",
                        email: "",
                        facebookUrl: "",
                        instagramUrl: "",
                        tiktokUrl: "",
                        url: "",
                        logoUrl: "",
                      },
                    });
                    setView("venues");
                  }}
                >
                  Selecionar este usuário
                </Button>
              </div>
            )}
            {!isUserLoading && !searchedUser && searchEmail && (
              <div className="text-sm text-red-500 mt-2">
                Usuário não encontrado.
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
