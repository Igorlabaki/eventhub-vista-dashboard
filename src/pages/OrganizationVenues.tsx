import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { CreateVenueForm } from "@/components/venue/CreateVenueForm";
import { EditOrganizationForm } from "@/components/organization/EditOrganizationForm";
import { useUpdateOrganizationMutations } from "@/hooks/organization/mutations/update";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { VenuesList } from "@/components/venue/VenuesList";
import { useVenueStore } from "@/store/venueStore";
import { useOrganizationStore } from "@/store/organizationStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrganizationVenues() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { currentOrganization, fetchOrganizationById } = useOrganizationStore();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>();

  const { venues, isLoading, fetchVenues } = useVenueStore();
  const { updateOrganization } = useUpdateOrganizationMutations(
    organizationId || ""
  );

  useEffect(() => {
    if (organizationId) {
      fetchVenues(organizationId);
      fetchOrganizationById(organizationId);
    }
  }, [organizationId, fetchVenues, fetchOrganizationById]);

  const handleUpdateOrganization = (values: { name: string }) => {
    if (!organizationId) {
      toast({
        title: "Erro",
        description: "ID da organização não encontrado",
        variant: "destructive",
      });
      return;
    }

    updateOrganization.mutate(
      { organizationId, data: { name: values.name } },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          toast({
            title: "Sucesso",
            description: "Nome da organização atualizado com sucesso",
          });
        },
      }
    );
  };

  const handleEditVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedVenueId(undefined);
  };

  return (
    <DashboardLayout
      title="Espaços"
      subtitle="Gerenciar espaços da organização"
    >
      <div className="flex flex-col h-full">
        <PageHeader
          isFormOpen={showForm}
          count={venues.length}
          onCreateClick={() => setShowForm(true)}
          createButtonText="Novo Espaço"
        />

        <div className="flex-1 overflow-hidden">
          <AnimatedFormSwitcher
            showForm={showForm}
            list={
              <VenuesList
                venues={venues}
                isLoading={isLoading}
                onCreateClick={() => setShowForm(true)}
                organizationId={organizationId || ""}
                onEditClick={handleEditVenue}
              />
            }
            form={
              <CreateVenueForm
                organizationId={organizationId || ""}
                userId={organizationId || ""}
                onSuccess={handleFormClose}
                venueId={selectedVenueId}
                isEditing={!!selectedVenueId}
              />
            }
          />
        </div>
      </div>

      {/* Dialog para editar organização */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <EditOrganizationForm
            organizationId={organizationId || ""}
            initialName={currentOrganization?.name || ""}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
