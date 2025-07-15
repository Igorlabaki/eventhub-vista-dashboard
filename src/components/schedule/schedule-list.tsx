import React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Schedule } from "@/types/schedule";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
interface ScheduleListProps {
  schedules: Schedule[];
  onDeleteSchedule: (schedule: Schedule) => void;
  emptyMessage?: string;
  className?: string;
  selectedScheduleIds?: string[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onCreateClick?: () => void;
  onEditClick?: (schedule: Schedule) => void;
}

export function ScheduleList({
  schedules = [],
  onDeleteSchedule,
  emptyMessage = "Nenhum cronograma encontrado",
  className,
  selectedScheduleIds = [],
  isLoading,
  isDeleting,
  onCreateClick,
  onEditClick,
}: ScheduleListProps) {
  const [scheduleToDelete, setScheduleToDelete] =
    React.useState<Schedule | null>(null);
    const { currentUserVenuePermission } = useUserVenuePermissionStore();
  // Link para programação
  const { currentProposal } = useProposalStore();
  const { selectedVenue } = useVenueStore();
  const proposalId = currentProposal?.id;
  const programacaoLink =
    proposalId && selectedVenue?.url
      ? `${selectedVenue.url}/orcamento/programacao/${proposalId}`
      : undefined;
  const whatsappMsg = encodeURIComponent(
    `Olá! Segue o link para acessar a programação do evento: ${programacaoLink}`
  );

    const numeroOriginal = selectedVenue.whatsappNumber || "";
    const numeroLimpo = numeroOriginal.replace(/\D/g, "");
    const numeroComPlus = numeroOriginal.startsWith('+') ? numeroOriginal : `+${numeroLimpo}`;
    const phoneNumber = parsePhoneNumberFromString(numeroComPlus);
    
    const numeroFinal = phoneNumber && phoneNumber.isValid()
      ? phoneNumber.number.replace('+', '')  // remove "+"
      : `55${numeroLimpo}`; // fallback to Brazil
    
    const whatsappUrl = numeroFinal
      ? `https://wa.me/${numeroFinal}?text=${whatsappMsg}`
      : `https://wa.me/?text=${whatsappMsg}`;
  

  const formatTime = (time: string) => {
    if (!time) return "";
    // Se vier no formato ISO, extrai só o horário
    const match = time.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
    // Se vier só o horário, retorna como está
    return time.split(":").slice(0, 2).join(":");
  };

  if (isLoading) {
    return null;
  }

  if (!Array.isArray(schedules) || schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
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
        <EmptyState
          title={emptyMessage}
          description="Crie um novo cronograma para começar a organizar suas atividades."
          actionText="Novo Cronograma"
          onAction={onCreateClick || (() => {})}
        />
      </div>
    );
  }

  
  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_PROPOSAL_SCHEDULE");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Table className="bg-white rounded-md shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>

            <TableHead className="w-[150px] text-center">Horário</TableHead>
            {hasEditPermission() && (
            <TableHead className="w-[100px] text-center">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow
              key={schedule.id}
              className={cn(
                "hover:bg-gray-50",
                selectedScheduleIds.includes(schedule.id) && "bg-violet-100"
              )}
            >
              <TableCell className="font-medium">{schedule.name}</TableCell>

              <TableCell className="w-[150px] text-center">
                {formatTime(schedule.startHour)} até{" "}
                {formatTime(schedule.endHour)}
              </TableCell>
              {hasEditPermission() && (
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {onEditClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(schedule);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setScheduleToDelete(schedule);
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
        open={!!scheduleToDelete}
        onOpenChange={(open) => !open && setScheduleToDelete(null)}
        onConfirm={async () => {
          if (scheduleToDelete) {
            await onDeleteSchedule(scheduleToDelete);
            setScheduleToDelete(null);
          }
        }}
        entityName={scheduleToDelete?.name || ""}
        entityType="cronograma"
        isPending={isDeleting}
      />
    </div>
  );
}
