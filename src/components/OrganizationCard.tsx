import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MoreVertical, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
export interface OrganizationCardProps {
  id: string;
  name: string;
  venueCount: number;
  newBudgetsCount?: number;
  nextEvent?: {
    name: string;
    date: string;
  };
}
export function OrganizationCard({
  id,
  name,
  venueCount,
  newBudgetsCount = 0
}: OrganizationCardProps) {
  const navigate = useNavigate();
  const handleViewVenues = () => {
    navigate(`/organization/${id}/venues`);
  };
  return <Card className="eventhub-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-eventhub-primary">
      <CardHeader className="eventhub-card-header pb-2">
        <div className="flex items-center">
          <Building className="h-5 w-5 text-eventhub-primary mr-2" />
          <h3 className="eventhub-subheading">{name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu</span>
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
            <div className="eventhub-stat bg-indigo-50 rounded-lg flex justify-center items-center">
              <span className="text-xs text-gray-500">Espaços</span>
              <span className="text-lg font-bold">{venueCount}</span>
            </div>
            
            <div className="eventhub-stat bg-indigo-50 rounded-lg flex justify-center items-center">
              <div className="flex items-center gap-1">
                
                <span className="text-xs text-gray-500">Notificacoes</span>
              </div>
              <span className="text-lg font-bold">{newBudgetsCount}</span>
            </div>
          </div>
          
          <Button className="w-full bg-eventhub-primary hover:bg-indigo-600 transition-all" onClick={handleViewVenues}>
            Ver Espaços
          </Button>
        </div>
      </CardContent>
    </Card>;
}