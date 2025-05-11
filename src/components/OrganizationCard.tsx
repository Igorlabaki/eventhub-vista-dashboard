
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export interface OrganizationCardProps {
  id: string;
  name: string;
  venueCount: number;
  nextEvent?: {
    name: string;
    date: string;
  };
}

export function OrganizationCard({
  id,
  name,
  venueCount,
  nextEvent,
}: OrganizationCardProps) {
  const navigate = useNavigate();

  const handleViewVenues = () => {
    navigate(`/organization/${id}/venues`);
  };

  return (
    <Card className="eventhub-card">
      <CardHeader className="eventhub-card-header pb-2">
        <h3 className="eventhub-subheading">{name}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="eventhub-stat">
              <span className="text-xs text-gray-500">Venues</span>
              <span className="text-lg font-bold">{venueCount}</span>
            </div>
            
            <div className="eventhub-stat">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Próximo Evento</span>
              </div>
              {nextEvent ? (
                <div className="text-sm font-medium line-clamp-1">{nextEvent.name}</div>
              ) : (
                <div className="text-sm text-gray-500">Nenhum evento</div>
              )}
            </div>
          </div>
          
          <Button
            className="w-full bg-eventhub-primary hover:bg-indigo-600"
            onClick={handleViewVenues}
          >
            Ver Venues
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
