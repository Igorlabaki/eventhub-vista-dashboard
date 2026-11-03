import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { FilterList } from "@/components/filterList";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useVenueAmenityStore } from "@/store/venueAmenityStore";
import { VenueAmenity } from "@/types/venue-amenity";

interface VenueAmenityListProps {
    amenities: VenueAmenity[];
    onCreateClick: () => void;
    onEditClick: (amenity: VenueAmenity) => void;
}

export function VenueAmenityList({ amenities, onCreateClick, onEditClick }: VenueAmenityListProps) {
    const [amenityToDelete, setAmenityToDelete] = useState<VenueAmenity | null>(null);
    const { deleteAmenity } = useVenueAmenityStore();
    const { toast } = useToast();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();
    const canEdit = currentUserVenuePermission?.permissions?.includes("EDIT_VENUE_AMENITIES") ?? false;

    const handleDelete = async () => {
        if (!amenityToDelete) return;
        try {
            const response = await deleteAmenity(amenityToDelete.id);
            const { title, message } = handleBackendSuccess(response, "Característica excluída com sucesso!");
            showSuccessToast({ title, description: message });
            setAmenityToDelete(null);
        } catch (error: unknown) {
            const { title, message } = handleBackendError(error, "Erro ao excluir característica. Tente novamente mais tarde.");
            toast({ title, description: message, variant: "destructive" });
        }
    };

    return (
        <>
            <FilterList
                items={amenities}
                filterBy={(amenity, query) => amenity.name.toLowerCase().includes(query.toLowerCase())}
                placeholder="Filtrar características..."
            >
                {(filtered) =>
                    filtered.length === 0 ? (
                        <EmptyState
                            hasEditPermission={canEdit}
                            title="Nenhuma característica cadastrada"
                            actionText="Nova característica"
                            onAction={onCreateClick}
                        />
                    ) : (
                        <Table className="bg-white rounded-md shadow-lg">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Posição</TableHead>
                                    <TableHead>Nome</TableHead>
                                    {canEdit && <TableHead className="w-[100px] text-center">Ações</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((amenity) => (
                                    <TableRow key={amenity.id}>
                                        <TableCell>{amenity.position}</TableCell>
                                        <TableCell className="font-medium">{amenity.name}</TableCell>
                                        {canEdit && (
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <button type="button" aria-label="Editar característica" onClick={() => onEditClick(amenity)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" aria-label="Excluir característica" onClick={() => setAmenityToDelete(amenity)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                }
            </FilterList>
            <ConfirmDeleteDialog
                open={!!amenityToDelete}
                onOpenChange={(open) => {
                    if (!open) setAmenityToDelete(null);
                }}
                onConfirm={handleDelete}
                entityName={amenityToDelete?.name || ""}
                entityType="característica"
            />
        </>
    );
}
