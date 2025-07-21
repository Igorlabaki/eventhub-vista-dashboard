import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersonListSkeleton } from "./person-list-skeleton";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Person, PersonType } from "@/types/person";
import { useVenueStore } from "@/store/venueStore";
import { usePersonStore } from "@/store/personStore";
import { FilterList } from "@/components/filterList";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface PersonListProps {
  persons: Person[];
  onDeletePerson?: (person: Person) => void;
  emptyMessage?: string;
  className?: string;
  selectedPersonIds?: string[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onCreateClick: () => void;
  onEditClick: (person: Person) => void;
  proposalId: string;
  type: PersonType;
  whatsapp?: string;
}

export function PersonList({
  persons,
  onDeletePerson,
  emptyMessage = "Nenhuma pessoa encontrada",
  className,
  selectedPersonIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick,
  proposalId,
  type,
  whatsapp,
}: PersonListProps) {
  const [personToDelete, setPersonToDelete] = React.useState<Person | null>(
    null
  );
  const { updatePerson } = usePersonStore();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  // Cálculo de presenças confirmadas
  const confirmedCount = persons.filter((p) => p.attendance).length;
  const totalCount = persons.length;

  // Função para alternar o attendance
  const handleToggleAttendance = async (person: Person) => {
    try {
      await updatePerson({
        personId: person.id,
        data: {
          attendance: !person.attendance,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar attendance:", error);
    }
  };

  // Link correto conforme o tipo
  const isGuest = type === PersonType.GUEST;
  const link = isGuest
    ? `https://event-hub-dashboard.vercel.app/proposal/${proposalId}/guest-list`
    : `https://event-hub-dashboard.vercel.app/proposal/${proposalId}/staff-list`;
  const whatsappMsg = encodeURIComponent(
    isGuest
      ? `Segue o link para registrar os convidados do seu evento: ${link}`
      : `Segue o link para registrar os colaboradores do seu evento: ${link}`
  );

  // Tratamento do número de WhatsApp usando libphonenumber-js
  const numeroOriginal = whatsapp || "";
  const numeroLimpo = numeroOriginal.replace(/\D/g, "");
  const numeroComPlus = numeroOriginal.startsWith("+")
    ? numeroOriginal
    : `+${numeroLimpo}`;
  const phoneNumber = parsePhoneNumberFromString(numeroComPlus);

  const numeroFinal =
    phoneNumber && phoneNumber.isValid()
      ? phoneNumber.number.replace("+", "") // remove "+"
      : `55${numeroLimpo}`; // fallback to Brazil

  const whatsappUrl = whatsapp
    ? `https://wa.me/${numeroFinal}?text=${whatsappMsg}`
    : `https://wa.me/?text=${whatsappMsg}`;

  const hasConfirmPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "CONFIRM_PROPOSAL_ATTENDANCE_LIST"
    );
  };

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_PROPOSAL_ATTENDANCE_LIST"
    );
  };

  const hasSendLinksPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "SEND_PROPOSAL_LINKS"
    );
  };

  if (isLoading) {
    return <PersonListSkeleton />;
  }

  if (!persons || persons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        {hasSendLinksPermission() && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2  
          text-blue-600 hover:text:black hover:underline 
          transition-colors text-sm"
          >
            Eviar link para o cliente
          </a>
        )}
        <EmptyState
          hasEditPermission={hasEditPermission()}
          title={emptyMessage}
          actionText="Nova Pessoa"
          onAction={onCreateClick}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Botão de link para o cliente */}
      <div className="flex items-center mb-2 w-full justify-between md:flex-row flex-col">
        <div className="text-sm font-medium text-gray-700">
          Presenças confirmadas:{" "}
          <span className="font-bold">{confirmedCount}</span> / {totalCount}
        </div>
        {hasSendLinksPermission() && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2  
          text-blue-600 hover:text:black hover:underline 
          transition-colors text-sm"
          >
            Eviar link para o cliente
          </a>
        )}
      </div>
      {/* Campo de busca e tabela filtrada */}
      <FilterList
        items={persons}
        filterBy={(person, query) =>
          person.name.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar pessoa..."
      >
        {(filteredPersons) => (
          <Table className="bg-white rounded-md shadow-lg">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Presença</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersons.map((person) => (
                <TableRow
                  key={person.id}
                  className={cn(
                    "hover:bg-gray-50",
                    selectedPersonIds.includes(person.id) && "bg-violet-100"
                  )}
                >
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          person.attendance
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {person.attendance ? "Confirmada" : "Pendente"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {hasConfirmPermission() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAttendance(person);
                          }}
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            person.attendance
                              ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                              : "text-green-500 hover:text-green-700 hover:bg-green-50"
                          )}
                          title={
                            person.attendance
                              ? "Cancelar presença"
                              : "Confirmar presença"
                          }
                        >
                          {person.attendance ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      {hasEditPermission() && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(person);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPersonToDelete(person);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </FilterList>
      <ConfirmDeleteDialog
        open={!!personToDelete}
        onOpenChange={(open) => !open && setPersonToDelete(null)}
        onConfirm={async () => {
          if (personToDelete && onDeletePerson) {
            onDeletePerson(personToDelete);
          }
        }}
        entityName={personToDelete ? `Pessoa ${personToDelete.name}` : ""}
        entityType="pessoa"
        isPending={isDeleting}
      />
    </div>
  );
}

export default PersonList;
