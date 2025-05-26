import { Search, Plus, Edit, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Owner } from "@/types/owner";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/EmptyState";
import { VenueSelectionDialog } from "./VenueSelectionDialog";
import { useGetVenuesList } from "@/hooks/venue/queries/list";
import { showSuccessToast } from "../ui/success-toast";
import { useOwnerStore } from "@/store/ownerStore";

interface OwnersListProps {
  owners: Owner[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onEditClick: (owner: Owner) => void;
  onEditVenuesClick: (owner: Owner) => void;
  organizationId: string;
}

export function OwnersList({
  owners,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onEditVenuesClick,
  organizationId,
}: OwnersListProps) {
  const { toast } = useToast();
  const { deleteOwner, isLoading } = useOwnerStore();
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const { data: venues = [] } = useGetVenuesList(organizationId);

  // Filter owners by search term
  const filteredOwners = owners.filter(owner => 
    owner.completeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.cpf.includes(searchTerm)
  );

  const handleDeleteClick = (owner: Owner) => {
    setOwnerToDelete(owner);
  };

  const handleConfirmDelete = async () => {
    if (!ownerToDelete) return;

    try {
      await deleteOwner(ownerToDelete.id);
      
      showSuccessToast({
        title: "Proprietário excluído",
        description: "O proprietário foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o proprietário.",
        variant: "destructive",
      });
    } finally {
      setOwnerToDelete(null);
    }
  };

  const handleVenueClick = (owner: Owner) => {
    setSelectedOwner(owner);
    setVenueDialogOpen(true);
  };

  return (
    <>
      {/* Owner List */}
      <div className="mt-4">
        {filteredOwners.length === 0 ? (
          <EmptyState
            title={searchTerm ? "Nenhum proprietário encontrado" : "Nenhum proprietário cadastrado"}
            description={searchTerm ? "Tente buscar com outros termos" : "Comece cadastrando seu primeiro proprietário"}
            actionText="Cadastrar proprietário"
            onAction={onCreateClick}
          />
        ) : (
          <Table className="bg-white rounded-lg shadow-lg">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:flex md:items-center">CPF</TableHead>
                <TableHead>Espaços</TableHead>
                <TableHead className="w-[100px]  text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.map((owner) => {
                const ownerVenueCount = owner.ownerVenue?.length || 0;
                
                return (
                  <TableRow 
                    key={owner.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => onEditClick(owner)}
                  >
                    <TableCell className="font-medium">{owner.completeName}</TableCell>
                    <TableCell className="hidden md:block">{owner.cpf}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={e => { e.stopPropagation(); handleVenueClick(owner); }}
                      >
                        {ownerVenueCount} {ownerVenueCount === 1 ? 'espaço' : 'espaços'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); onEditClick(owner); }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteClick(owner); }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!ownerToDelete}
        onOpenChange={() => setOwnerToDelete(null)}
        onConfirm={handleConfirmDelete}
        entityName={ownerToDelete?.completeName || ""}
        entityType="proprietário"
        isPending={isLoading}
      />

      {/* Venue Selection Dialog */}
      {selectedOwner && (
        <VenueSelectionDialog
          open={venueDialogOpen}
          onOpenChange={setVenueDialogOpen}
          venues={venues}
          selectedVenues={selectedOwner.ownerVenue?.map(v => v.venueId) || []}
          ownerId={selectedOwner.id}
          organizationId={organizationId}
        />
      )}
    </>
  );
} 