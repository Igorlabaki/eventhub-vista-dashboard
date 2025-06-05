import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { useState, useEffect } from "react";
import { OwnerForm } from "@/components/owner/OwnerForm";
import { OwnersList } from "@/components/owner/OwnersList";
import { OwnersListSkeleton } from "@/components/owner/OwnersListSkeleton";
import { Button } from "@/components/ui/button";
import { Owner } from "@/types/owner";
import { FilterList } from "@/components/filterList";
import { useOwnerStore } from "@/store/ownerStore";

export default function OrganizationOwners() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { 
    owners, 
    isLoading, 
    fetchOrganizationOwners 
  } = useOwnerStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<Owner | null>(null);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationOwners(organizationId);
    }
  }, [organizationId, fetchOrganizationOwners]);

  const handleCreateClick = () => {
    setCurrentOwner(null);
    setIsCreating(true);
    setIsEditing(false);
  };
  
  const handleEdit = (owner: Owner) => {
    setCurrentOwner(owner);
    setIsEditing(true);
    setIsCreating(false);
  };
  
  const handleEditVenues = (owner: Owner) => {
    // TODO: Implementar edição de espaços
  };
  
  const resetForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentOwner(null);
  };

  const filterOwners = (owner: Owner, query: string) => {
    const searchTerm = query.toLowerCase();
    return (
      owner.completeName.toLowerCase().includes(searchTerm) ||
      owner.cpf.includes(searchTerm)
    );
  };

  return (
    <DashboardLayout
      title="Proprietários"
      subtitle="Gerenciar proprietários da organização"
    >
      <PageHeader
        isFormOpen={isCreating || isEditing}
        count={owners.length}
        onCreateClick={handleCreateClick}
        createButtonText="Novo Proprietário"
      />

      {/* Lista de Proprietários */}
      {!isCreating && !isEditing && (
        <div className="animate-fade-in">
          {isLoading ? (
            <OwnersListSkeleton />
          ) : (
            <FilterList
              items={owners}
              filterBy={filterOwners}
              placeholder="Buscar proprietários..."
            >
              {(filteredOwners) => (
                <OwnersList
                  owners={filteredOwners}
                  searchTerm=""
                  onSearchChange={() => {}}
                  onCreateClick={handleCreateClick}
                  onEditClick={handleEdit}
                  onEditVenuesClick={handleEditVenues}
                  organizationId={organizationId || ""}
                />
              )}
            </FilterList>
          )}
        </div>
      )}
      
      {/* Formulário de Criação/Edição */}
      {(isCreating || isEditing) && (
        <OwnerForm
          owner={currentOwner || undefined}
          organizationId={organizationId || ""}
          onCancel={resetForm}
        />
      )}
    </DashboardLayout>
  );
}
