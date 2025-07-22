import * as z from "zod";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { Organization } from "@/types/organization";
import { UserOrganizationList } from "@/components/permissions/UserOrganizationList";
import { PageHeader } from "@/components/PageHeader";
import { useUserOrganizationStore } from "@/store/userOrganizationStore";
import { useParams } from "react-router-dom";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { UserOrganization } from "@/types/userOrganization";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { showSuccessToast } from "@/components/ui/success-toast";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PermissionVenueManager } from "@/components/permissions/PermissionVenueManager";
import { UserOrganizationSection } from "@/components/permissions/userOrganizationSection";
import { VenuePermissionSection } from "@/components/permissions/VenuePermissionSection";
import { OrganizationPermissionSection } from "@/components/permissions/OrganizationPermissionSection";
import { useOrganizationStore } from "@/store/organizationStore";
import { PermissionOrganizationManager } from "@/components/permissions/PermissionOrganizationManager";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import AccessDenied from "@/components/accessDenied";

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

// Troque os estados para guardar apenas os IDs
type SelectedVenuePermission = {
  id: string;
  permissions: string[];
  role: string;
} | null;

export default function OrganizationPermissionsV2() {
  const {
    searchUserByEmail,
    searchedUser,
    user,
    isLoading: isUserLoading,
  } = useUserStore();

  const { fetchVenues } = useVenueStore();
  const { id: organizationId } = useParams<{ id: string }>();
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedUserOrganizationId, setSelectedUserOrganizationId] = useState<
    string | null
  >(null);
  const [selectedUserVenuePermission, setSelectedUserVenuePermission] =
    useState<SelectedVenuePermission>(null);
  const [view, setView] = useState<"users" | "venues" | "venue-permissions" | "organization-permissions">("users");
  const [tempUserOganization, setTempUserOganization] = useState<UserOrganization | null>(null);

  const {
    userOrganizations,
    isLoading: isLoadingUsers,
    fetchUserOrganizations,
    deleteUserOrganization,
  } = useUserOrganizationStore();

  const { venues } = useVenueStore();
  const { currentOrganization } = useOrganizationStore();
  const { currentUserOrganizationPermission } = useUserOrganizationPermissionStore();
  // Derive os objetos completos a partir dos IDs e listas
  const selectedUserOrganization =
    userOrganizations?.find((uo) => uo.id === selectedUserOrganizationId) ||
    null;
  const selectedVenue = venues?.find((v) => v.id === selectedVenueId) || null;

  // Ajuste os handlers para salvar apenas os IDs
  const handleUserClick = (userOrganization: UserOrganization) => {
    setSelectedUserOrganizationId(userOrganization.id);
    setView("venues");
  };

  const handleVenueClick = (
    venue: import("@/types/venue").ItemListVenueResponse,
    venuePermission?: {
      id: string;
      permissions: string[];
      role: string;
    }
  ) => {
    setSelectedVenueId(venue.id);
    if (venuePermission) {
      setSelectedUserVenuePermission(venuePermission);
    } else {
      // Cria uma permission temporária para o espaço
      setSelectedUserVenuePermission({
        id: "", // vazio indica temporário
        permissions: [],
        role: "", // ou "user" se quiser um padrão
      });
    }
    setView("venue-permissions");
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

  // Ajuste o handleGoBack para limpar apenas os IDs e atualizar a lista
  const handleGoBack = () => {
    if (organizationId) {
      fetchUserOrganizations(organizationId); // Atualiza a lista
    }
    setTempUserOganization(null); // Limpa o temporário
    if (view === "venues") {
      setView("users");
      setSelectedUserOrganizationId(null);
    } else if (view === "venue-permissions") {
      setView("venues");
      setSelectedVenueId(null);
    } else if (view === "organization-permissions") {
      setView("users"); // Volta para a lista após criar permissão
      setSelectedVenueId(null);
      setSelectedUserOrganizationId(null);
    }
  };

  const handleSavePermissions = (newPermissions: string[]) => {
    console.log(newPermissions);
  };

  // Debounce para buscar usuário
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(searchEmail);
    }, 500); // 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [searchEmail]);

  // Chama a busca quando debouncedEmail muda
  useEffect(() => {
    if (debouncedEmail) {
      searchUserByEmail(debouncedEmail);
    }
  }, [debouncedEmail, searchUserByEmail]);

  useEffect(() => {
    if (organizationId) {
      fetchUserOrganizations(organizationId);
      fetchVenues({ organizationId, userId: user?.id || "" });
    }
  }, []);


  return (
    <>
      <DashboardLayout
        title="Permissões"
        subtitle="Gerencie as permissões dos usuários"
      >
        {view === "users" && (
          <UserOrganizationSection
            addUserDialogOpen={addUserDialogOpen}
            setAddUserDialogOpen={setAddUserDialogOpen}
            userOrganizations={userOrganizations || []}
            isLoadingUsers={isLoadingUsers}
            handleUserClick={handleUserClick}
            handleDeleteUserOrganization={handleDeleteUserOrganization}
            searchEmail={searchEmail}
            setSearchEmail={setSearchEmail}
            isUserLoading={isUserLoading}
            searchedUser={searchedUser}
            selectedUser={selectedUser}
            organizationId={organizationId}
            setTempUserOganization={setTempUserOganization}
            setView={setView}
          />
        )}

        {view === "venues" && selectedUserOrganization && (
          <div
            className={cn(
              "transition-all  duration-300 ease-in-out  bg-white rounded-md overflow-hidden border-[1.5px] border-gray-200 pt-2 pb-5 px-2",
              view === "venues"
                ? "opacity-100 scale-100 w-full"
                : "opacity-0 scale-95 absolute w-full"
            )}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <h2 className="text-md md:text-xl font-semibold text-gray-800">
                {`Permissões: ${selectedUserOrganization.user.username}`}
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-4 font-semibold md:ml-11 md:w-full text-center md:text-left">
              * Selecione um espaço ou a organização para gerenciar as
              permissões:
            </p>
            <div className="flex flex-col gap-2">
              <OrganizationPermissionSection
                selectedUserOrganization={selectedUserOrganization}
                userOrganizationPermission={
                  selectedUserOrganization?.userOrganizationPermission
                }
                organization={currentOrganization}
                handleGoBack={handleGoBack}
                handleOrganizationClick={() => setView("organization-permissions")}
              />
              {/* Só mostra VenuePermissionSection se já existe userOrganizationPermission.id */}
              {selectedUserOrganization?.userOrganizationPermission?.id && (
                <VenuePermissionSection
                  view={view}
                  selectedUserOrganization={selectedUserOrganization}
                  venues={venues}
                  handleGoBack={handleGoBack}
                  handleVenueClick={handleVenueClick}
                />
              )}
            </div>
          </div>
        )}

        {view === "venues" && tempUserOganization?.user?.email && (
          <div
            className={cn(
              "transition-all  duration-300 ease-in-out  bg-white rounded-md overflow-hidden border-[1.5px] border-gray-200 pt-2 pb-5 px-2",
              view === "venues"
                ? "opacity-100 scale-100 w-full"
                : "opacity-0 scale-95 absolute w-full"
            )}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <h2 className="text-md md:text-xl font-semibold text-gray-800">
                {`Permissões: ${tempUserOganization.user.username}`}
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-4 font-semibold md:ml-11 md:w-full text-center md:text-left">
              * Selecione um espaço ou a organização para gerenciar as
              permissões:
            </p>
            <div className="flex flex-col gap-2">
              <OrganizationPermissionSection
                selectedUserOrganization={tempUserOganization}
                userOrganizationPermission={
                  tempUserOganization?.userOrganizationPermission
                }
                organization={currentOrganization}
                handleGoBack={handleGoBack}
                handleOrganizationClick={() => setView("organization-permissions")}
              />
              {/* Só mostra VenuePermissionSection se já existe userOrganizationPermission.id */}
              {tempUserOganization?.userOrganizationPermission?.id && (
                <VenuePermissionSection
                  view={view}
                  selectedUserOrganization={tempUserOganization}
                  venues={venues}
                  handleGoBack={handleGoBack}
                  handleVenueClick={handleVenueClick}
                />
              )}
            </div>
          </div>
        )}


        {view === "venue-permissions" &&
          selectedVenue &&
          selectedUserOrganization &&
          selectedUserVenuePermission && (
            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                view === "venue-permissions"
                  ? "opacity-100 scale-100 w-full"
                  : "opacity-0 scale-95 absolute w-full"
              )}
            >
              <PermissionVenueManager
                onGoBack={handleGoBack}
                venueId={selectedVenue.id}
                venueName={selectedVenue.name}
                organizationId={organizationId || ""}
                onSavePermissions={handleSavePermissions}
                userId={selectedUserOrganization.user.id}
                initialRole={selectedUserVenuePermission.role}
                userOrganizationId={selectedUserOrganization.id}
                userName={selectedUserOrganization.user.username}
                userVenuePermissionId={selectedUserVenuePermission?.id}
                initialPermissions={selectedUserVenuePermission.permissions}
              />
            </div>
          )}

        {view === "organization-permissions" &&
          selectedUserOrganization && (
            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                view === "organization-permissions"
                  ? "opacity-100 scale-100 w-full"
                  : "opacity-0 scale-95 absolute w-full"
              )}
            >
              <PermissionOrganizationManager
                userName={selectedUserOrganization.user.username}
                userOrganizationId={selectedUserOrganization.id}
                onGoBack={handleGoBack}
                organizationId={organizationId || ""}
                onSavePermissions={handleSavePermissions}
                userId={selectedUserOrganization.user.id}
                initialRole={selectedUserOrganization.userOrganizationPermission?.role || "user"}
                userOrganizationPermissionId={selectedUserOrganization.userOrganizationPermission?.id}
                initialPermissions={selectedUserOrganization.userOrganizationPermission?.permissions || []}
              />
            </div>
          )}

        {view === "organization-permissions" &&
          tempUserOganization && (
            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                view === "organization-permissions"
                  ? "opacity-100 scale-100 w-full"
                  : "opacity-0 scale-95 absolute w-full"
              )}
            >
              <PermissionOrganizationManager
                userName={tempUserOganization.user.username}
                userOrganizationId={tempUserOganization.id}
                onGoBack={handleGoBack}
                organizationId={organizationId || ""}
                onSavePermissions={handleSavePermissions}
                userId={tempUserOganization.user.id}
                initialRole={tempUserOganization.userOrganizationPermission?.role || "user"}
                userOrganizationPermissionId={tempUserOganization.userOrganizationPermission?.id}
                initialPermissions={tempUserOganization.userOrganizationPermission?.permissions || []}
              />
            </div>
          )}
      </DashboardLayout>
    </>
  );
}
