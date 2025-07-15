import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Building } from "lucide-react";
import { FilterList } from "@/components/filterList";
import { OrganizationSection } from "@/components/organization/OrganizationSection";
import { useOrganizationStore } from "@/store/organizationStore";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useVenueStore } from "@/store/venueStore";

export default function Dashboard() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useUserStore();
  const { organizations, fetchOrganizations, isLoading, error, clearError } = useOrganizationStore();
  const { toast } = useToast();
 
  useEffect(() => {
    if (user?.id) {
      fetchOrganizations(user.id);
    }
  }, [user?.id, fetchOrganizations]);
  console.log(user?.id, "userId")
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

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  return (
    <DashboardLayout title="Organizações" subtitle="Gerencie suas organizações">
      <PageHeader
        count={organizations.length}
        onCreateClick={handleCreateClick}
        createButtonText="Nova Organização"
        isFormOpen={isCreating}
      />
      {isCreating ? (
        <OrganizationSection
          organizations={organizations.map(org => ({
            ...org,
            _count: { 
              venues: typeof org._count === 'object' ? org._count.venues : 0 
            }
          }))}
          userId={user?.id}
          isLoading={isLoading}
          isCreating={isCreating}
          onCreateClick={handleCreateClick}
          onCancelCreate={handleCancelCreate}
        />
      ) : (
        <FilterList
          items={organizations}
          filterBy={(org, query) =>
            org.name.toLowerCase().includes(query.toLowerCase())
          }
          placeholder="Buscar organização..."
        >
          {(filtered) => (
            <OrganizationSection
              organizations={filtered.map(org => ({
                ...org,
                _count: { 
                  venues: typeof org._count === 'object' ? org._count.venues : 0 
                }
              }))}
              userId={user?.id}
              isLoading={isLoading}
              isCreating={isCreating}
              onCreateClick={handleCreateClick}
              onCancelCreate={handleCancelCreate}
            />
          )}
        </FilterList>
      )}
    </DashboardLayout>
  );
}
