
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export interface VenueCardProps {
  id: string;
  name: string;
  capacity: number;
  upcomingEvents: number;
  organizationId: string;
}

export function VenueCard({
  id,
  name,
  capacity,
  upcomingEvents,
  organizationId,
}: VenueCardProps) {
  const navigate = useNavigate();

  const handleViewVenue = () => {
    navigate(`/venue`);
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
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Eventos</span>
              </div>
              <span className="text-lg font-bold">{upcomingEvents}</span>
            </div>
            
            <div className="eventhub-stat">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Capacidade</span>
              </div>
              <span className="text-lg font-bold">{capacity} pessoas</span>
            </div>
          </div>
          
          <Button
            className="w-full bg-eventhub-primary hover:bg-indigo-600"
            onClick={handleViewVenue}
          >
            Gerenciar Venue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
