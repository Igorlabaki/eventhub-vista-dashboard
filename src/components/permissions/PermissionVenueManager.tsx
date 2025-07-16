import * as React from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateUserPermissionMutations } from "@/hooks/permissions/mutation/create";
import { useUpdateUserPermissionMutations } from "@/hooks/permissions/mutation/update";
import { showSuccessToast } from "../ui/success-toast";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useDeleteUserPermissionMutations } from "@/hooks/permissions/mutation/delete";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import {
  generalPermissions,
  proposalEditPermissions,
  proposalViewPermissions,
  venueEditPermissions,
  venueViewPermissions,
} from "@/types/permissions";

// Interface que define a estrutura de uma permissão
interface Permission {
  enum: string; // Identificador único da permissão
  display: string; // Nome amigável para exibição da permissão
}

// Props do componente PermissionManager
interface PermissionManagerProps {
  userId: string; // ID do usuário que está sendo gerenciado
  userName: string; // Nome do usuário para exibição
  venueId: string; // ID do local (venue) onde as permissões serão aplicadas
  venueName: string; // Nome do local para exibição
  userVenuePermissionId: string; // Nome do local para exibição
  onGoBack: () => void; // Função chamada ao clicar no botão de voltar
  // Remover role de onSavePermissions
  onSavePermissions: (permissions: string[]) => void; // Função para salvar as permissões // ID da permissão do usuário (opcional)
  organizationId?: string; // ID da organização (opcional)
  userOrganizationId?: string; // ID da relação usuário-organização (opcional)
  initialPermissions?: string[];
  initialRole?: string;
}

export function PermissionVenueManager({
  userId,
  userName,
  venueId,
  venueName,
  onGoBack,
  onSavePermissions,
  organizationId,
  userOrganizationId,
  userVenuePermissionId,
  initialPermissions = [],
  initialRole = "user",
}: PermissionManagerProps) {
  const { toast } = useToast();

  const {
    createUserVenuePermission,
    updateUserVenuePermission,
    deleteUserVenuePermission,
    isLoading,
  } = useUserVenuePermissionStore();

  // Remover o useMemo problemático

  // Estado que controla o papel do usuário (admin/user)
  const [role, setRole] = React.useState<string>(initialRole);

  // Estado para armazenar as permissões temporárias
  const [tempPermissions, setTempPermissions] =
    React.useState<string[]>(initialPermissions);

  // Atualizar tempPermissions se initialPermissions mudar
  React.useEffect(() => {
    setTempPermissions(initialPermissions);
  }, [initialPermissions]);

  // Estado para controlar o dialog de confirmação de deleção
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletePending, setDeletePending] = React.useState(false);

  // Função que verifica se o usuário possui uma permissão específica
  const hasPermission = (permissionKey: string): boolean => {
    const exactMatch = tempPermissions.some((p) => p === permissionKey);
    const partialMatch = tempPermissions.some((p) => p.includes(permissionKey));
    return exactMatch || partialMatch;
  };

  // Função que gerencia a mudança de papel do usuário
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole === "admin") {
      // Se for admin, concede todas as permissões
      const allPermissions = [
        ...generalPermissions.map((p) => p.enum),
        ...venueViewPermissions.map((p) => p.enum),
        ...venueEditPermissions.map((p) => p.enum),
        ...proposalViewPermissions.map((p) => p.enum),
        ...proposalEditPermissions.map((p) => p.enum),
        /*         ...organizationPermissions.map((p) => p.enum),
        ...organizationEditPermissions.map((p) => p.enum), */
      ];
      setTempPermissions(allPermissions);
    } else {
      // Se for user, remove todas as permissões
      setTempPermissions([]);
    }
  };

  // Função que alterna uma permissão específica
  const togglePermission = (permissionKey: string) => {
    // Cria uma cópia do array atual de permissões
    const currentPermissions = [...tempPermissions];

    // Verifica se a permissão já existe
    const permissionIndex = currentPermissions.indexOf(permissionKey);

    if (permissionIndex === -1) {
      // Se não existe, adiciona a permissão
      currentPermissions.push(permissionKey);
    } else {
      // Se existe, remove a permissão
      currentPermissions.splice(permissionIndex, 1);
    }

    // Atualiza apenas o estado temporário
    setTempPermissions(currentPermissions);
  };

  // Função que renderiza uma seção de permissões
  const renderPermissionSection = (
    mode: "VIEW" | "EDIT",
    permissionsList: Permission[]
  ) => (
    <div className="space-y-4 mt-2">
      <Table className="bg-white rounded-md shadow-lg  border-[1px]  border-gray-900 border-rounded-md">
        <TableHeader className="bg-eventhub-primary">
          <TableRow>
            <TableHead className="text-white">
              {mode === "VIEW" ? "Visualização" : "Edição"}
            </TableHead>
            <TableHead className="w-[100px] text-center text-white">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissionsList.map((permission) => {
            const isEnabled = hasPermission(permission.enum);

            return (
              <TableRow key={permission.enum} className="cursor-pointer">
                <TableCell className="font-medium">
                  {permission.display}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => togglePermission(permission.enum)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const handleSave = async () => {
    try {
      const flatPermissions = tempPermissions;

      if (userVenuePermissionId && userVenuePermissionId !== "") {
        // UPDATE
        const updateData = {
          userVenuePermissionId: userVenuePermissionId,
          venueId,
          permissions: flatPermissions,
          role, // Adicionado para garantir que a role seja enviada na atualização
        };
        await updateUserVenuePermission(updateData, organizationId || "");
        showSuccessToast({
          title: "Permissão atualizada!",
          description:
            "As permissões do usuário foram atualizadas com sucesso.",
        });
      } else {
        // CREATE
        const createData = {
          role, // role só para UserVenuePermission/UserOrganizationPermission
          venueId,
          userOrganizationId: userOrganizationId || "",
          userId: userId,
          organizationId: organizationId || "",
          permissions: flatPermissions,
        };
        await createUserVenuePermission(createData);
        showSuccessToast({
          title: "Permissão criada!",
          description: "As permissões do usuário foram criadas com sucesso.",
        });
      }
      onGoBack();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as permissões.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserVenuePermission(
        userVenuePermissionId,
        organizationId || ""
      );
      showSuccessToast({
        title: "Permissão removida!",
        description: "As permissões do usuário foram removidas com sucesso.",
      });
      onGoBack();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover as permissões.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="bg-white px-2 py-4 rounded-md shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onGoBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className=" text-lg md:text-xl font-semibold text-gray-800">
              Permissões: {venueName}
            </h2>
          </div>

          <p className="text-sm text-gray-500 md:ml-11 md:w-full text-center md:text-left">
            Gerenciar permissões de {userName}
          </p>

          {userVenuePermissionId && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 hover:bg-red-100 rounded-full"
              onClick={() => setDeleteDialogOpen(true)}
              title="Deletar permissão do usuário"
            >
              <Trash2 className="h-5 w-5 text-gray-500 md:hover:text-red-600" />
            </Button>
          )}
        </div>

        <div className="mt-4 w-full mx-auto flex justify-center md:justify-start">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Papel do usuário:</Label>
            <Select
              value={role}
              onValueChange={(value) => {
                handleRoleChange(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-8">
          {/* View Permissions Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mt-10">Espaço</h2>
            {renderPermissionSection("VIEW", venueViewPermissions)}
            {renderPermissionSection("EDIT", venueEditPermissions)}
          </div>

          {/* Edit Permissions Section */}

          {/* Proposal Permissions Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-800">Orçamentos</h2>
            {renderPermissionSection("VIEW", proposalViewPermissions)}
            {renderPermissionSection("EDIT", proposalEditPermissions)}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800">Geral</h2>
            {renderPermissionSection("VIEW", generalPermissions)}
          </div>

          <div className="mt-8">
            <Button
              className="w-full"
              onClick={() => {
                handleSave();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Atualizar"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        entityName={userName}
        entityType="permissão do usuário"
        isPending={isLoading}
      />
    </>
  );
}
