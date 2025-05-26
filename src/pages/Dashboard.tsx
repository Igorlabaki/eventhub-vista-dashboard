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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Building className="h-5 w-5 text-eventhub-primary" />
          Suas Organizações ({organizations.length})
        </h2>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-eventhub-primary hover:bg-indigo-600"
        >
          <Plus className="hidden md:block h-4 w-4 mr-2 text-sm md:text-base" />
          Nova Organização
        </Button>
      </div>
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
