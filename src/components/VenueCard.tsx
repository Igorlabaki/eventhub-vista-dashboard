import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { DateEvent } from "@/types/date-event";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useUserStore } from "@/store/userStore";


export interface VenueCardProps {
  id: string;
  name: string;
  nextEvent: DateEvent | null;
  upcomingEvents: number;
  organizationId: string;
  onEditClick?: () => void;
}

export function VenueCard({
  id,
  name,
  nextEvent,
  upcomingEvents,
  organizationId,
  onEditClick,
}: VenueCardProps) {
  const navigate = useNavigate();
  const { fetchCurrentUserVenuePermission } = useUserVenuePermissionStore();
  const { user } = useUserStore();

  const handleViewVenue = async () => {
    await fetchCurrentUserVenuePermission({
      organizationId: organizationId,
      userId: user?.id || "",
      venueId: id,
    });
    navigate(`/venue/${id}/notifications`);
  };

  // Função para formatar a data sem considerar fuso horário
  function formatarDataIso(isoString: string) {
    const [datePart, timePart] = isoString.split("T");
    const [year, month, day] = datePart.split("-");
    const hour = timePart.slice(0, 5); // "HH:mm"
    return `${day}/${month}/${year} às ${hour}`;
  }
  return (
    <Card className="eventhub-card border-l-4 border-l-eventhub-primary">
      <CardHeader className="flex flex-row items-center justify-between mb-4 pb-2">
        <CardTitle className="text-sm font-medium">
          <Link to={`/dashboard/organizations/${organizationId}/venues/${id}`}>
            {name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="">
            <div className="eventhub-stat">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Próxima data</span>
              </div>
              {nextEvent ? (
                <div className="flex items-center justify-between p-3">
                  <span className="text-[13px] md:text-sm font-semibold ">
                    {nextEvent.title}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatarDataIso(new Date(nextEvent.startDate).toISOString())}
                  </span>
                </div>
              ) : (
                <span className="text-[13px] md:text-sm text-gray-400  p-3">
                  Nenhuma data agendada
                </span>
              )}
              {/* Se quiser mostrar o número de pessoas, adicione aqui: */}
              {/* <span className="text-sm text-gray-500">{nextEvent?.guests} pessoas</span> */}
            </div>
          </div>

          <Button
            className="w-full bg-eventhub-primary hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={handleViewVenue}
          >
            Gerenciar Venue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
