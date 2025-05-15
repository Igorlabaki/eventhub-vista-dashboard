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
import { showSuccessToast } from "./success-toast";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useDeleteUserPermissionMutations } from "@/hooks/permissions/mutation/delete";

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
  viewPermissions: Permission[]; // Lista de permissões de visualização disponíveis
  editPermissions: Permission[]; // Lista de permissões de edição disponíveis
  proposalPermissions: Permission[]; // Lista de permissões relacionadas a eventos/orçamentos
  userPermissions: {
    [userId: string]: {
      [venueId: string]: {
        id: string;
        permissions: string[] | string;
      };
    };
  };
  onGoBack: () => void; // Função chamada ao clicar no botão de voltar
  onSavePermissions: (permissions: string[], role: string) => void; // Função para salvar as permissões
  userPermissionId?: string; // ID da permissão do usuário (opcional)
  organizationId?: string; // ID da organização (opcional)
  userOrganizationId?: string; // ID da relação usuário-organização (opcional)
}

export function PermissionManager({
  userId,
  userName,
  venueId,
  venueName,
  viewPermissions,
  editPermissions,
  proposalPermissions,
  userPermissions,
  onGoBack,
  onSavePermissions,
  userPermissionId,
  organizationId,
  userOrganizationId,
}: PermissionManagerProps) {
  const { toast } = useToast();

  // Instanciar as mutations
  const { createUserPermission } = useCreateUserPermissionMutations(organizationId);
  const { updateUserPermission } = useUpdateUserPermissionMutations(organizationId);
  const { deleteUserPermission } = useDeleteUserPermissionMutations(organizationId);

  // Hook que processa e formata as permissões do usuário para o local específico
  const userVenuePermissions = React.useMemo(() => {
    const userVenue = userPermissions[userId]?.[venueId];
    if (!userVenue) return [];
    const permissions = userVenue.permissions;
    if (!permissions) return [];
    if (typeof permissions === "string") {
      return permissions.replace(/\s+/g, "").split(",");
    }
    return permissions;
  }, [userId, venueId, userPermissions]);

  // Estado que controla o papel do usuário (admin/user)
  const [role, setRole] = React.useState<string>(() => {
    const userVenue = userPermissions[userId]?.[venueId];
    let permissions: string[] = [];
    if (userVenue) {
      if (typeof userVenue.permissions === "string") {
        permissions = userVenue.permissions.replace(/\s+/g, "").split(",");
      } else if (Array.isArray(userVenue.permissions)) {
        permissions = userVenue.permissions;
      }
    }
    return permissions.includes("admin") ? "admin" : "user";
  });

  // Estado para armazenar as permissões temporárias
  const [tempPermissions, setTempPermissions] =
    React.useState<string[]>(userVenuePermissions);

  // Estado para controlar o dialog de confirmação de deleção
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletePending, setDeletePending] = React.useState(false);

  console.log("Permissões do usuário (final):", userVenuePermissions);

  // Função que verifica se o usuário possui uma permissão específica
  const hasPermission = (permissionKey: string): boolean => {
    const exactMatch = tempPermissions.some((p) => p === permissionKey);
    const partialMatch = tempPermissions.some((p) => p.includes(permissionKey));

    console.log(`Verificando permissão ${permissionKey}:`, {
      exactMatch,
      partialMatch,
      permissions: tempPermissions,
    });

    return exactMatch || partialMatch;
  };

  // Função que gerencia a mudança de papel do usuário
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole === "admin") {
      // Se for admin, concede todas as permissões
      const allPermissions = [
        ...viewPermissions.map((p) => p.enum),
        ...editPermissions.map((p) => p.enum),
        ...proposalPermissions.map((p) => p.enum),
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

  // Hook para pegar o userPermissionId da venue selecionada
  const currentUserPermissionId = React.useMemo(() => {
    const userVenue = userPermissions[userId]?.[venueId];
    if (!userVenue) return undefined;
    // Se userVenue for objeto, pega o id
    if (typeof userVenue === "object" && "id" in userVenue) {
      return userVenue.id;
    }
    // Se não tiver id, retorna undefined
    return undefined;
  }, [userId, venueId, userPermissions]);

  // Função que renderiza uma seção de permissões
  const renderPermissionSection = (
    sectionTitle: string,
    permissionsList: Permission[]
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{sectionTitle}</h3>
      <Table className="bg-white rounded-md shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Permissão</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissionsList.map((permission) => {
            const isEnabled = hasPermission(permission.enum);
            console.log(
              `Renderizando permissão ${permission.enum}:`,
              isEnabled
            );

            return (
              <TableRow key={permission.enum}>
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

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onGoBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Permissões: {venueName}
              </h2>
              <p className="text-sm text-gray-500">
                Gerenciar permissões de {userName}
              </p>
            </div>
          </div>
          {currentUserPermissionId && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-red-100"
              onClick={() => setDeleteDialogOpen(true)}
              title="Deletar permissão do usuário"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Papel do usuário:</Label>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* View Permissions Section */}
          {renderPermissionSection("Permissões de Visualização", viewPermissions)}

          {/* Edit Permissions Section */}
          {renderPermissionSection("Permissões de Edição", editPermissions)}

          {/* Proposal Permissions Section */}
          {renderPermissionSection(
            "Permissões de Eventos / Orçamentos",
            proposalPermissions
          )}

          <div className="mt-8">
            <Button
              className="w-full"
              onClick={async () => {
                const flatPermissions = tempPermissions
                  .flatMap((p) => p.split(","))
                  .map((p) => p.trim())
                  .filter(Boolean);

                if (flatPermissions.length === 0 && currentUserPermissionId && currentUserPermissionId !== "") {
                  setDeleteDialogOpen(true);
                  return;
                }

                if (currentUserPermissionId && currentUserPermissionId !== "") {
                  // UPDATE
                  await updateUserPermission.mutateAsync({
                    userPermissionId: currentUserPermissionId,
                    role,
                    venueId,
                    permissions: flatPermissions,
                  });
                  showSuccessToast({
                    title: "Permissão atualizada!",
                    description:
                      "As permissões do usuário foram atualizadas com sucesso.",
                  });
                } else {
                  // CREATE
                  await createUserPermission.mutateAsync({
                    role,
                    venueId,
                    userOrganizationId: userOrganizationId || "",
                    userId: userId,
                    organizationId: organizationId || "",
                    permissions: flatPermissions,
                  });
                  showSuccessToast({
                    title: "Permissão criada!",
                    description:
                      "As permissões do usuário foram criadas com sucesso.",
                  });
                }
                onGoBack();
              }}
            >
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Renderizar o dialog de confirmação de deleção */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          setDeletePending(true);
          await deleteUserPermission.mutateAsync(currentUserPermissionId);
          setDeletePending(false);
          setDeleteDialogOpen(false);
          showSuccessToast({
            title: "Permissão removida!",
            description: "As permissões do usuário foram removidas com sucesso.",
          });
          onGoBack();
        }}
        entityName={userName}
        entityType="permissão do usuário"
        isPending={deletePending}
      />
    </>
  );
}
