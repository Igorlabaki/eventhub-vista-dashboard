import * as React from "react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/EmptyState"
import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DateEventListSkeleton } from "@/components/dateEvent/dateEvent-list-skeleton"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { DateEvent } from "@/types/dateEvent"
import { formatDate } from "@/lib/utils"
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore"


interface DateEventListProps {
  dateEvents: DateEvent[]
  onDeleteDateEvent?: (dateEvent: DateEvent) => void
  emptyMessage?: string
  className?: string
  selectedDateEventIds?: string[]
  isLoading?: boolean
  isDeleting?: boolean
  onCreateClick: () => void
  onEditClick: (dateEvent: DateEvent) => void
}

export function DateEventList({
  dateEvents,
  onDeleteDateEvent,
  emptyMessage = "Nenhuma data encontrada",
  className,
  selectedDateEventIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick
}: DateEventListProps) {
  const [dateEventToDelete, setDateEventToDelete] = React.useState<DateEvent | null>(null);

  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  if (isLoading) {
    return <DateEventListSkeleton />;
  }

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_PROPOSAL_DATES");
  };

  if (!dateEvents || dateEvents.length === 0) {
    return <EmptyState hasEditPermission={hasEditPermission()} title={emptyMessage} actionText="Nova Data" onAction={onCreateClick}/>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Table className="bg-white rounded-md shadow-lg ">
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Data</TableHead>
            {hasEditPermission() && (
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dateEvents.map((dateEvent) => (
            <TableRow 
              key={dateEvent.id}
              onClick={() => hasEditPermission() && onEditClick(dateEvent)}
              className={cn(
                "hover:bg-gray-50",
                selectedDateEventIds.includes(dateEvent.id) && "bg-violet-100"
              )}
            >
              <TableCell className="font-medium">
                {dateEvent.title}
              </TableCell>
              <TableCell>
                {formatDate(dateEvent.startDate)}
              </TableCell>
              {hasEditPermission() && (
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(dateEvent);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateEventToDelete(dateEvent);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDeleteDialog
        open={!!dateEventToDelete}
        onOpenChange={(open) => !open && setDateEventToDelete(null)}
        onConfirm={async () => {
          if (dateEventToDelete && onDeleteDateEvent) {
            onDeleteDateEvent(dateEventToDelete);
          }
        }}
        entityName={dateEventToDelete ? `Data ${dateEventToDelete.title}` : ""}
        entityType="data"
        isPending={isDeleting}
      />
    </div>
  )
} 