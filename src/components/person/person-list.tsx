import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Pencil, Trash2 } from "lucide-react";
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
import { Person } from "@/types/person";

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
  onEditClick
}: PersonListProps) {
  const [personToDelete, setPersonToDelete] = React.useState<Person | null>(null);

  if (isLoading) {
    return <PersonListSkeleton />;
  }

  if (!persons || persons.length === 0) {
    return <EmptyState title={emptyMessage} actionText="Nova Pessoa" onAction={onCreateClick} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Table className="bg-white rounded-md shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Presença</TableHead>
            <TableHead className="w-[100px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {persons.map((person) => (
            <TableRow 
              key={person.id}
              className={cn(
                "hover:bg-gray-50",
                selectedPersonIds.includes(person.id) && "bg-violet-100"
              )}
            >
              <TableCell className="font-medium">
                {person.name}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${person.attendance
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                    }`}
                >
                  {person.attendance ? "Confirmada" : "Pendente"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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