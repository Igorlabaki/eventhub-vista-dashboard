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
  const [scheduleToDelete, setScheduleToDelete] = React.useState<Schedule | null>(null);

  const formatTime = (time: string) => {
    if (!time) return '';
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
      <EmptyState
        title={emptyMessage}
        description="Crie um novo cronograma para começar a organizar suas atividades."
        actionText="Novo Cronograma"
        onAction={onCreateClick || (() => {})}
      />
    );
  }
  console.log(schedules);
  return (
    <div className={cn("space-y-4", className)}>
      <Table className="bg-white rounded-md shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
           
            <TableHead className="w-[150px] text-center">Horário</TableHead>
            <TableHead className="w-[100px] text-center">Ações</TableHead>
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
                {formatTime(schedule.startHour)} até {formatTime(schedule.endHour)}
              </TableCell>
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