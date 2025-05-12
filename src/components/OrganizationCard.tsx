
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MoreVertical, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

export interface OrganizationCardProps {
  id: string;
  name: string;
  venueCount: number;
  newBudgetsCount?: number;
}

export function OrganizationCard({
  id,
  name,
  venueCount,
  newBudgetsCount = 0
}: OrganizationCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState(name);

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

  const handleSaveEdit = () => {
    if (!organizationName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da organização não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    // Here we would call an API to update the organization name
    toast({
      title: "Sucesso",
      description: "Nome da organização atualizado com sucesso.",
    });
    setEditDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    // Here we would call an API to delete the organization
    toast({
      title: "Sucesso",
      description: "Organização excluída com sucesso.",
    });
    setDeleteDialogOpen(false);
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
                <DropdownMenuItem onClick={handleEditOrganization}>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDeleteOrganization}>
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
            
            <Button className="w-full bg-eventhub-primary hover:bg-indigo-600 transition-all" onClick={handleViewVenues}>
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
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Organização</Label>
              <Input
                id="name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Esta operação irá excluir permanentemente a organização "{name}" e todos os seus dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
