import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VenueCard } from "@/components/VenueCard";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PermissionsManager } from "@/components/PermissionsManager";
import { useGetVenuesList } from "@/hooks/venue/queries/list";
import { CreateVenueForm } from "@/components/venue/CreateVenueForm";
import { VenueCardSkeleton } from "@/components/venue/VenueCardSkeleton";
import { FilterList } from "@/components/filterList";
import { useGetOrganizationById } from "@/hooks/organization/queries/getById";
import { EditOrganizationForm } from "@/components/organization/EditOrganizationForm";
import { useUpdateOrganizationMutations } from "@/hooks/organization/mutations/update";
import { useUser } from "@/hooks/user/queries/byId";
import { OwnersManager } from "@/components/owner/OwnersManager";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export default function OrganizationVenues() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { data: organization } = useGetOrganizationById(organizationId || "");
  const { data: venues = [], isLoading } = useGetVenuesList(
    organizationId || ""
  );

  const navigate = useNavigate();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ownersDialogOpen, setOwnersDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);

  const { updateOrganization } = useUpdateOrganizationMutations(
    organizationId || ""
  );

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

  const handleViewVenue = (venueId: string) => {
    navigate(`/venue/${venueId}`);
  };

  return (
    <DashboardLayout
      title="Espaços"
      subtitle="Gerenciar espaços da organização"
    >
      <PageHeader
        title="Espaços"
        count={venues.length}
        onCreateClick={() => setDialogOpen(true)}
        createButtonText="Novo Espaço"
      />

      <FilterList
        items={venues}
        filterBy={(venue, query) =>
          venue.name.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar espaço..."
      >
        {(filtered) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <VenueCardSkeleton key={i} />
                ))
              : filtered.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    id={venue.id}
                    name={venue.name}
                    capacity={venue.maxGuest}
                    upcomingEvents={0}
                    organizationId={venue.organizationId}
                  />
                ))}

            {!isLoading && filtered.length === 0 && (
              <EmptyState
                title="Nenhum espaço cadastrado"
                description="Comece cadastrando seu primeiro espaço para gerenciar eventos"
                actionText="Cadastrar primeiro espaço"
                onAction={() => setDialogOpen(true)}
              />
            )}
          </div>
        )}
      </FilterList>

      {/* Dialog para criar novo espaço */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Espaço</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <CreateVenueForm
              organizationId={organizationId || ""}
              userId={organizationId || ""}
              onSuccess={() => setDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar organização */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <EditOrganizationForm
            initialName={organization?.name || ""}
            onSubmit={handleUpdateOrganization}
            onCancel={() => setEditDialogOpen(false)}
            isPending={updateOrganization.isPending}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
