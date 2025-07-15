import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Proposal } from "@/types/proposal";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface EventTableProps {
  events: Proposal[];
  isLoading: boolean;
  onEventClick: (event: Proposal) => void;
  monthNames: string[];
  selectedMonth: number;
  selectedYear: number;
}

export function EventTable({
  events,
  isLoading,
  onEventClick,
  monthNames,
  selectedMonth,
  selectedYear,
}: EventTableProps) {
  
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  if (isLoading) {
    return (
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-[120px] ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const hasViewPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("VIEW_PROPOSAL_AMOUNTS");
  };

  if (events.length === 0) {
    return (
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              {hasViewPermission() && (
                <TableHead className="text-right">Valor</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum evento encontrado para {monthNames[selectedMonth]}/{selectedYear}.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            {hasViewPermission() && (
              <TableHead className="text-right">Valor</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onEventClick(event)}
            >
              <TableCell className="font-medium">{event.completeClientName}</TableCell>
              <TableCell>
                {format(new Date(event.startDate), "dd/MM/yyyy", {
                  locale: pt,
                })}
              </TableCell>
              {hasViewPermission() && ( 
              <TableCell className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(event.totalAmount)}
              </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 