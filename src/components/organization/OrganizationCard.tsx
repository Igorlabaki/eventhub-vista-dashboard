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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { showSuccessToast } from "../ui/success-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EditOrganizationForm } from "./EditOrganizationForm";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useOrganizationStore } from "@/store/organizationStore";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";

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

  const { deleteOrganization, updateOrganization, isLoading } = useOrganizationStore();
  const { toast } = useToast();

  const editForm = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: { name },
  });

  const handleViewVenues = () => {
    navigate(`/organization/${id}/venues`);
  };

  const handleEditOrganization = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteOrganization = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteOrganization(id);
      const { title, message } = handleBackendSuccess(response, "Organização excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setDeleteDialogOpen(false);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir organização. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
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
            <div className="">
              <div className="eventhub-stat bg-indigo-50 rounded-lg flex justify-center items-center">
                <span className="text-xs text-gray-500">Espaços</span>
                <span className="text-lg font-bold">{venueCount}</span>
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
        <DialogContent className="w-[90%] md:w-[50%] rounded-md">
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <EditOrganizationForm
            organizationId={id}
            initialName={name}
            onCancel={() => setEditDialogOpen(false)}
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
        isPending={isLoading}
      />
    </>
  );
}
