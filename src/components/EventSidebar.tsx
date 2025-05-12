
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface EventSidebarProps {
  onBack: () => void;
  event: {
    id: string;
    title: string;
    date: Date;
    type: string;
    guests: number;
    value: number;
  };
}

export function EventSidebar({ onBack, event }: EventSidebarProps) {
  return (
    <div className="w-full sm:w-64 md:w-80 bg-gray-50 border-r p-4 flex flex-col h-[calc(100vh-64px)] overflow-auto">
      <Button variant="ghost" onClick={onBack} className="inline-flex items-center text-sm">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para lista
      </Button>
      
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold line-clamp-2">{event.title}</h3>
          <p className="text-sm text-gray-500">{event.type}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span>
            {format(event.date, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span>{event.guests} convidados</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span>Status: Confirmado</span>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">Valor Total</p>
          <p className="text-2xl font-semibold">
            {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(event.value)}
          </p>
        </div>
      </div>
    </div>
  );
}
