
import { 
  Edit, 
  History, 
  MessageCircle, 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  File,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-700">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-gray-800 w-full justify-start"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-medium mb-1">{event.title}</h2>
        <p className="text-sm text-gray-400">{event.type}</p>
        <p className="text-sm text-gray-400 mt-1">
          {format(event.date, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
        </p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <nav className="space-y-1 p-2">
          <SidebarItem icon={Edit} label="Editar Evento" />
          <SidebarItem icon={History} label="Ver Histórico" />
          <SidebarItem icon={MessageCircle} label="Entrar em contato" />
          <SidebarItem icon={FileText} label="Enviar Orçamento" />
          <SidebarItem icon={File} label="Enviar Contrato" />
          <SidebarItem icon={Calendar} label="Agendar Data" />
          <SidebarItem icon={DollarSign} label="Efetuar Pagamento" />
          <SidebarItem icon={Users} label="Lista de Presença" />
          <SidebarItem icon={Clock} label="Programação" />
          <SidebarItem icon={File} label="Documentos" />
        </nav>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}

function SidebarItem({ icon: Icon, label, disabled }: SidebarItemProps) {
  return (
    <Button 
      variant="ghost" 
      className={`w-full justify-start text-left ${disabled ? 'opacity-50' : 'hover:bg-gray-800'} text-white`}
      disabled={disabled}
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );
}
