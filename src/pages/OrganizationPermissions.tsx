import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Venue } from "@/components/ui/venue-list";
import { PermissionManager } from "@/components/permissions/permission-manager";
import { PageHeader } from "@/components/PageHeader";
import { UserOrganizationList } from "@/components/permissions/UserOrganizationList";
import { VenuePermissionsList } from "@/components/permissions/VenuePermissionsList";
import { UserOrganization } from "@/types/userOrganization";
import {
  userViewPermissions,
  userEditPermissions,
  userProposalPermissions,
} from "@/types/permissions";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/components/ui/success-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useUserOrganizationStore } from "@/store/userOrganizationStore";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";

type UserPermissionState = {
  [userId: string]: {
    [venueId: string]: {
      id: string;
      permissions: string[] | string;
      role: string;
    };
  };
};

// Schema for adding a new user
const addUserSchema = z.object({
  email: z.string().email("Email inválido"),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export default function OrganizationPermissions() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { toast } = useToast();

  // State
  const [selectedUserOrganization, setSelectedUserOrganization] =
    useState<UserOrganization | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissionState>(
    {}
  );
  const [view, setView] = useState<"users" | "venues" | "permissions">("users");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Stores
  const { 
    userOrganizations, 
    isLoading: isLoadingUsers,
    fetchUserOrganizations,
    deleteUserOrganization,
  } = useUserOrganizationStore();

  const {
    venues,
    isLoading: isLoadingVenues,
    fetchVenues
  } = useVenueStore();

  const {
    searchUserByEmail,
    searchedUser,
    user,
    isLoading: isUserLoading
  } = useUserStore();

  // Fetch data
  useEffect(() => {
    if (organizationId) {
      fetchUserOrganizations(organizationId);
      fetchVenues({ organizationId, userId: user?.id || "" });
    }
  }, [organizationId, fetchUserOrganizations, fetchVenues]);

  // Debounce para busca de e-mail
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchEmail) {
        searchUserByEmail(searchEmail);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchEmail, searchUserByEmail]);

  // Transformar as permissões da API para o formato esperado pelo componente
  useEffect(() => {
    if (userOrganizations) {
      const permissions: UserPermissionState = {};

      userOrganizations.forEach((org) => {
        permissions[org.user.id] = {};
        org.userPermissions.forEach((permission) => {
          permissions[org.user.id][permission.venueId || ""] = {
            id: permission.id,
            permissions: permission.permissions,
            role: permission.role,
          };
        });
      });
      setUserPermissions(permissions);
    }
  }, [userOrganizations]);

  const handleUserClick = (userOrganization: UserOrganization) => {
    setSelectedUserOrganization(userOrganization);
    setView("venues");
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setView("permissions");
  };

  const handleSavePermissions = (newPermissions: string[]) => {
    if (!selectedUserOrganization || !selectedVenue) return;

    setUserPermissions((prev) => {
      const updated = { ...prev };

      if (!updated[selectedUserOrganization.user.id]) {
        updated[selectedUserOrganization.user.id] = {};
      }

      updated[selectedUserOrganization.user.id][selectedVenue.id] = {
        id:
          updated[selectedUserOrganization.user.id][selectedVenue.id]?.id || "",
        permissions: newPermissions,
        role: "",
      };

      return updated;
    });

    setView("venues");
  };

  const goBack = () => {
    if (view === "venues") {
      setView("users");
      setSelectedUserOrganization(null);
    } else if (view === "permissions") {
      setView("venues");
      setSelectedVenue(null);
    }
  };

  const handleDeleteUserOrganization = async (userOrganization) => {
    try {
      await deleteUserOrganization(userOrganization.id);
      showSuccessToast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso da organização.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o usuário.",
        variant: "destructive",
      });
    }
  };
  
  // Render the appropriate view based on state
  const renderContent = () => {
    return (
      <div className="relative min-h-screen">
        {/* Users list view */}
        <div className={cn(
          "transition-all duration-300 ease-in-out h-[90vh]",
          view === "users" ? "opacity-100 scale-100 w-full" : "opacity-0 scale-95 absolute w-full"
        )}>
          {view === "users" && (
            <>
              <PageHeader
                isFormOpen={addUserDialogOpen}
                count={userOrganizations?.length || 0}
                onCreateClick={() => setAddUserDialogOpen(true)}
                createButtonText="Adicionar Usuário"
              />

              <UserOrganizationList
                userOrganizations={userOrganizations || []}
                onUserClick={handleUserClick}
                isLoading={isLoadingUsers}
                onCreateClick={() => setAddUserDialogOpen(true)}
                onDeleteUserOrganization={handleDeleteUserOrganization}
              />
              {/* Modal de adicionar usuário */}
              {addUserDialogOpen && (
                <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                  <DialogContent className="w-[90%] md:w-[50%] rounded-md">
                    <DialogHeader>
                      <DialogTitle>Buscar usuário por e-mail</DialogTitle>
                    </DialogHeader>
                    <Input
                      value={searchEmail}
                      onChange={e => setSearchEmail(e.target.value)}
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
                          <strong>{searchedUser.username}</strong> ({searchedUser.email})
                        </div>
                        <Button
                          onClick={() => {
                            setSearchEmail("");
                            setDebouncedEmail("");
                            setAddUserDialogOpen(false);
                            handleUserClick({
                              id: "",
                              user: searchedUser,
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
                                attachments: []
                              },
                              userPermissions: []
                            });
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
            </>
          )}
        </div>

        {/* Venues list view */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          view === "venues" ? "opacity-100 scale-100 w-full" : "opacity-0 scale-95 absolute w-full"
        )}>
          {view === "venues" && selectedUserOrganization && (
            <VenuePermissionsList
              venues={venues}
              onVenueClick={handleVenueClick}
              onBackClick={goBack}
              userPermissions={Object.fromEntries(
                Object.entries(
                  userPermissions[selectedUserOrganization.user.id] || {}
                ).map(([venueId, obj]) => [
                  venueId,
                  {
                    permissions: Array.isArray(obj.permissions)
                      ? obj.permissions
                      : typeof obj.permissions === "string"
                      ? obj.permissions.replace(/\s+/g, "").split(",")
                      : [],
                    role: obj.role || "user"
                  }
                ])
              )}
              title={`Permissões para ${selectedUserOrganization.user.username}`}
              subtitle="Selecione um espaço para gerenciar as permissões:"
            />
          )}
        </div>

        {/* Permissions management view */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          view === "permissions" ? "opacity-100 scale-100 w-full" : "opacity-0 scale-95 absolute w-full"
        )}>
          {view === "permissions" && selectedUserOrganization && selectedVenue && (
            <PermissionManager
              userId={selectedUserOrganization.user.id}
              userName={selectedUserOrganization.user.username}
              venueId={selectedVenue.id}
              userOrganizationId={selectedUserOrganization.id}
              organizationId={organizationId || ""}
              venueName={selectedVenue.name}
              viewPermissions={userViewPermissions}
              editPermissions={userEditPermissions}
              proposalPermissions={userProposalPermissions}
              userPermissions={userPermissions}
              userPermissionId={userPermissions[selectedUserOrganization.user.id]?.[selectedVenue.id]?.id}
              onGoBack={goBack}
              onSavePermissions={handleSavePermissions}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <DashboardLayout
        title="Permissões"
        subtitle="Gerencie as permissões dos usuários"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
}
