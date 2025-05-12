
import { 
  Edit, 
  History, 
  MessageCircle, 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  File 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BudgetSidebarProps {
  onBack: () => void;
  budget: {
    id: string;
    clientName: string;
    eventDate: Date;
    eventType: string;
    totalValue: number;
    guestCount: number;
    eventTime: string;
    details: {
      baseValue: number;
      extraHour: number;
      cleaning: number;
      receptionist: number;
      security: number;
      valuePerPerson: number;
      contactInfo: {
        email: string;
        whatsapp: string;
        hasVisitedVenue: boolean;
        referralSource: string;
      };
    };
  };
}

export function BudgetSidebar({ onBack, budget }: BudgetSidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full min-h-[calc(100vh-64px)]">
      <div className="p-4 border-b border-gray-700">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-gray-800 w-full justify-start"
        >
          ← Voltar para lista
        </Button>
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-medium mb-1">{budget.clientName}</h2>
        <p className="text-sm text-gray-400">{budget.eventType}</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <nav className="space-y-1 p-2">
          <SidebarItem icon={Edit} label="Editar Orçamento" />
          <SidebarItem icon={History} label="Ver Histórico" />
          <SidebarItem icon={MessageCircle} label="Entrar em contato" />
          <SidebarItem icon={FileText} label="Enviar Orçamento" />
          <SidebarItem icon={File} label="Enviar Contrato" />
          <SidebarItem icon={Calendar} label="Agendar Data" />
          <SidebarItem icon={DollarSign} label="Efetuar Pagamento" disabled />
          <SidebarItem icon={Users} label="Lista de Presença" disabled />
          <SidebarItem icon={Clock} label="Programação" disabled />
          <SidebarItem icon={File} label="Documentos" disabled />
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
