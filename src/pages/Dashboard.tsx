import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FilterList } from "@/components/filterList";
import { OrganizationCreateForm } from "@/components/organization/OrganizationCreateForm";
import { OrganizationList } from "@/components/organization/OrganizationList";
import { useOrganizationStore } from "@/store/organizationStore";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useVenueStore } from "@/store/venueStore";
export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useUserStore();
  const { organizations, fetchOrganizations, isLoading, error, clearError } = useOrganizationStore();
  const { toast } = useToast();
 
  useEffect(() => {
    if (user?.id) {
      fetchOrganizations(user.id);
    }
  }, [user?.id, fetchOrganizations]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  return (
    <DashboardLayout title="Organizações" subtitle="Gerencie suas organizações">
      <PageHeader
        count={organizations.length}
        onCreateClick={() => setDialogOpen(true)}
        createButtonText="Nova Organização"
        isFormOpen={dialogOpen}
      />
      <FilterList
        items={organizations}
        filterBy={(org, query) =>
          org.name.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar organização..."
      >
        {(filtered) => (
          <OrganizationList 
            organizations={filtered.map(org => ({
              ...org,
              _count: { 
                venues: typeof org._count === 'object' ? org._count.venues : 0 
              }
            }))} 
            isLoading={isLoading} 
          />
        )}
      </FilterList>
      {/* Dialog para criar nova organização */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[80%] md:max-w-[40%] rounded-md">
          <DialogHeader>
            <DialogTitle>Nova Organização</DialogTitle>
            <DialogDescription>
              Crie uma nova organização para gerenciar seus espaços de eventos
            </DialogDescription>
          </DialogHeader>
          <OrganizationCreateForm
            userId={user?.id}
            onCancel={() => setDialogOpen(false)}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
