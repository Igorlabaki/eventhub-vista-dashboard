import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Venue } from "@/types/venue";
import { useUpdateOwnerMutations } from "@/hooks/owner/mutations/update";
import { showSuccessToast } from "../ui/success-toast";

interface VenueSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venues: Venue[];
  selectedVenues: string[];
  ownerId?: string;
  organizationId: string;
}

export function VenueSelectionDialog({
  open,
  onOpenChange,
  venues,
  selectedVenues: initialSelectedVenues,
  ownerId,
  organizationId,
}: VenueSelectionDialogProps) {
  const { toast } = useToast();
  const { updateOwner } = useUpdateOwnerMutations(organizationId);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);

  // Atualiza o estado quando o modal abrir ou quando initialSelectedVenues mudar
  useEffect(() => {
    if (open) {
      setSelectedVenues(initialSelectedVenues);
    }
  }, [open, initialSelectedVenues]);

  const handleToggleVenue = (venueId: string) => {
    setSelectedVenues((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

  const handleSave = async () => {
    if (!ownerId) return;
    try {
      await updateOwner.mutateAsync({
        ownerId,
        data: { venueIds: selectedVenues },
      });
      onOpenChange(false);
      showSuccessToast({
        title: "Espaços atualizados",
        description:
          "Os espaços do proprietário foram atualizados com sucesso.",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar os espaços.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] md:max-w-[50%] rounded-md">
        <DialogHeader>
          <DialogTitle>Selecionar Espaços</DialogTitle>
          <span className="text-gray-500 text-sm mt-1">
            Selecione os espaços para este proprietário:
          </span>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {venues.map((venue) => {
            const selected = selectedVenues.includes(venue.id);
            return (
              <button
                type="button"
                key={venue.id}
                onClick={() => handleToggleVenue(venue.id)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border transition
                  ${
                    selected
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }
                  focus:outline-none`}
              >
                <span className="text-base text-gray-800">{venue.name}</span>
                <span
                  className={`h-5 w-5 flex items-center justify-center rounded-full border-2
                    ${
                      selected
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300 bg-white"
                    }`}
                >
                  {selected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
