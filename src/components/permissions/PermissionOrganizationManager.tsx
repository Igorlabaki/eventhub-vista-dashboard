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
import { showSuccessToast } from "@/components/ui/success-toast";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
  organizationViewPermissions,
  organizationEditPermissions,
} from "@/types/permissions";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import { useUserOrganizationStore } from "@/store/userOrganizationStore";

interface Permission {
  enum: string;
  display: string;
}

interface PermissionOrganizationManagerProps {
  userId: string;
  userName: string;
  organizationId: string;
  userOrganizationId?: string; // agora pode ser opcional
  userOrganizationPermissionId?: string;
  onGoBack: () => void;
  onSavePermissions: (permissions: string[]) => void;
  initialPermissions?: string[] | string;
  initialRole?: string;
  createUserOrganization?: (data: {
    userId: string;
    organizationId: string;
    role: string;
    permissions: string[];
  }) => Promise<{ id: string }>; // nova prop opcional
}

export function PermissionOrganizationManager({
  userId,
  userName,
  organizationId,
  userOrganizationId = "",
  userOrganizationPermissionId = "",
  onGoBack,
  onSavePermissions,
  initialPermissions = [],
  initialRole = "user",
  createUserOrganization,
}: PermissionOrganizationManagerProps) {
  const { toast } = useToast();
  const { currentUserOrganizationPermission } =
    useUserOrganizationPermissionStore();
  const {
    createUserOrganizationPermission,
    updateUserOrganizationPermission,
    deleteUserOrganizationPermission,
    isLoading,
  } = useUserOrganizationPermissionStore();
  const { fetchUserOrganizations } = useUserOrganizationStore();
  const [role, setRole] = React.useState<string>(initialRole);
  const [tempPermissions, setTempPermissions] = React.useState<string[]>(
    Array.isArray(initialPermissions)
      ? initialPermissions
      : typeof initialPermissions === "string"
      ? initialPermissions
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : []
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof initialPermissions === "string") {
      setTempPermissions(
        initialPermissions
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      );
    } else if (Array.isArray(initialPermissions)) {
      setTempPermissions(initialPermissions);
    } else {
      setTempPermissions([]);
    }
  }, [initialPermissions]);

  const hasPermission = (permissionKey: string): boolean => {
    return tempPermissions.includes(permissionKey);
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole === "admin") {
      const allPermissions = [
        ...organizationViewPermissions.map((p) => p.enum),
        ...organizationEditPermissions.map((p) => p.enum),
      ];
      setTempPermissions(allPermissions);
    } else {
      setTempPermissions([]);
    }
  };

  const togglePermission = (permissionKey: string) => {
    const currentPermissions = [...tempPermissions];
    const permissionIndex = currentPermissions.indexOf(permissionKey);
    if (permissionIndex === -1) {
      currentPermissions.push(permissionKey);
    } else {
      currentPermissions.splice(permissionIndex, 1);
    }
    setTempPermissions(currentPermissions);
  };

  const hasEditPermission = () => {
    if (!currentUserOrganizationPermission?.permissions) return false;
    return currentUserOrganizationPermission.permissions.includes(
      "EDIT_ORG_WEBSITE_IMAGES"
    );
  };

  const renderPermissionSection = (
    mode: "VIEW" | "EDIT",
    permissionsList: Permission[]
  ) => (
    <div className="space-y-4 mt-2">
      <Table className="bg-white rounded-md shadow-lg border-[1px] border-gray-900 border-rounded-md">
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
                      onCheckedChange={() =>
                        hasEditPermission() && togglePermission(permission.enum)
                      }
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
      let finalUserOrganizationId = userOrganizationId;
      // Se não existe userOrganizationId, é temporário: criar primeiro
      if (!finalUserOrganizationId && createUserOrganization) {
        const created = await createUserOrganization({
          userId,
          organizationId,
          role,
          permissions: flatPermissions,
        });
        finalUserOrganizationId = created.id;
      }
      if (userOrganizationPermissionId && userOrganizationPermissionId !== "") {
        // UPDATE
        const updateData = {
          userOrganizationPermissionId: userOrganizationPermissionId,
          permissions: flatPermissions,
          role,
        };
        await updateUserOrganizationPermission(updateData);
        await fetchUserOrganizations(organizationId);
        showSuccessToast({
          title: "Permissão atualizada!",
          description:
            "As permissões do usuário foram atualizadas com sucesso.",
        });
      } else {
        // CREATE
        const createData = {
          organizationId,
          userOrganizationId: finalUserOrganizationId,
          userId,
          permissions: flatPermissions,
          role,
        };
        await createUserOrganizationPermission(createData);
        await fetchUserOrganizations(organizationId);
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
      await deleteUserOrganizationPermission(
        userOrganizationPermissionId || ""
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
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Permissões da Organização
            </h2>
          </div>
          <p className="text-sm text-gray-500 md:ml-11 md:w-full text-center md:text-left">
            Gerenciar permissões de {userName}
          </p>
          {hasEditPermission() && userOrganizationPermissionId && (
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
            {hasEditPermission() ? (
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
            ) : (
              <div className="w-[180px]">
                <p className="text-sm font-medium">{role}</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mt-10">
              Organização
            </h2>
            {renderPermissionSection("VIEW", organizationViewPermissions)}
            {renderPermissionSection("EDIT", organizationEditPermissions)}
          </div>
          <div className="mt-8">
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!hasEditPermission() || isLoading}
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
