import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MoreVertical, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/user/queries/byId";
import { useDeleteOrganizationMutations } from "@/hooks/organization/mutations/delete";
import { showSuccessToast } from "../ui/success-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateOrganizationMutations } from "@/hooks/organization/mutations/update";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EditOrganizationForm } from "./EditOrganizationForm";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

export interface OrganizationCardProps {
  id: string;
  name: string;
  venueCount: number;
  newBudgetsCount?: number;
}

const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});
type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>;

export function OrganizationCard({
  id,
  name,
  venueCount,
  newBudgetsCount = 0,
}: OrganizationCardProps) {
  const navigate = useNavigate();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: user } = useUser();

  const { deleteOrganization } = useDeleteOrganizationMutations(user?.id);
  const { updateOrganization } = useUpdateOrganizationMutations(user?.id);

  const editForm = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: { name },
  });

  const handleViewVenues = () => {
    navigate(`/organization/${id}/venues`);
  };

  const handleEditOrganization = () => {
    // Close the dropdown menu
    setEditDialogOpen(true);
  };

  const handleDeleteOrganization = () => {
    // Close the dropdown menu and open delete dialog
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteOrganization.mutate(id, {
      onSuccess: () => {
        showSuccessToast({
          title: "Sucesso",
          description: "Organização excluída com sucesso.",
        });
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleUpdateOrganization = (values: UpdateOrganizationFormValues) => {
    updateOrganization.mutate(
      { organizationId: id, data: { name: values.name } },
      {
        onSuccess: () => {
          showSuccessToast({
            title: "Sucesso",
            description: "Nome da organização atualizado com sucesso.",
          });
          setEditDialogOpen(false);
        },
      }
    );
  };

  return (
    <>
      <Card className="eventhub-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-eventhub-primary">
        <CardHeader className="eventhub-card-header pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-eventhub-primary mr-2" />
              <h3 className="eventhub-subheading">{name}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditOrganization}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleDeleteOrganization}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="eventhub-stat bg-indigo-50 rounded-lg flex justify-center items-center">
                <span className="text-xs text-gray-500">Espaços</span>
                <span className="text-lg font-bold">{venueCount}</span>
              </div>

              <div className="eventhub-stat bg-indigo-50 rounded-lg flex justify-center items-center">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Orçamentos</span>
                </div>
                <span className="text-lg font-bold">{newBudgetsCount}</span>
              </div>
            </div>

            <Button
              className="w-full bg-eventhub-primary hover:bg-indigo-600 transition-all"
              onClick={handleViewVenues}
            >
              Ver Espaços
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <EditOrganizationForm
            initialName={name || ""}
            onSubmit={handleUpdateOrganization}
            onCancel={() => setEditDialogOpen(false)}
            isPending={updateOrganization.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={name}
        entityType="organização"
        isPending={deleteOrganization.isPending}
      />
    </>
  );
}
