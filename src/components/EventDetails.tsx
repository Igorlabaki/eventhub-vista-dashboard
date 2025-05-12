
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Users, Calendar, Clock, ClipboardList, Mail, Phone } from "lucide-react";

interface EventDetailsProps {
  event: {
    id: string;
    title: string;
    date: Date;
    type: string;
    guests: number;
    status: string;
    value: number;
    time?: string;
    details?: {
      baseValue?: number;
      extraHour?: number;
      cleaning?: number;
      receptionist?: number;
      security?: number;
      valuePerPerson?: number;
      contactInfo?: {
        email?: string;
        whatsapp?: string;
        hasVisitedVenue?: boolean;
        referralSource?: string;
      };
    };
  };
  onClose: () => void;
}

export function EventDetails({ event, onClose }: EventDetailsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Default values for optional properties
  const details = event.details || {
    baseValue: event.value * 0.6,
    extraHour: event.value * 0.1,
    cleaning: event.value * 0.05,
    receptionist: event.value * 0.05,
    security: event.value * 0.2,
    valuePerPerson: event.value / event.guests,
    contactInfo: {
      email: "contato@example.com",
      whatsapp: "(11) 99999-9999",
      hasVisitedVenue: true,
      referralSource: "Site"
    }
  };
  
  const eventTime = event.time || "19:00/00:00";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações do Evento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Users className="h-5 w-5 text-eventhub-primary" />
            <div>
              <p className="text-xs text-gray-500">Convidados</p>
              <p className="font-medium">{event.guests} pessoas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-eventhub-primary" />
            <div>
              <p className="text-xs text-gray-500">Data</p>
              <p className="font-medium">
                {format(event.date, "dd/MM/yyyy", { locale: pt })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-eventhub-primary" />
            <div>
              <p className="text-xs text-gray-500">Horário</p>
              <p className="font-medium">{eventTime}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Valores</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Valor Base</span>
            <span className="font-medium">{formatCurrency(details.baseValue)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Hora Extra</span>
            <span className="font-medium">{formatCurrency(details.extraHour)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Limpeza</span>
            <span className="font-medium">{formatCurrency(details.cleaning)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Recepcionista</span>
            <span className="font-medium">{formatCurrency(details.receptionist)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Segurança</span>
            <span className="font-medium">{formatCurrency(details.security)}</span>
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatCurrency(event.value)}</span>
          </div>
          
          <div className="mt-4 pt-2 border-t">
            <div className="flex justify-between text-sm text-gray-600">
              <span>* Valor por pessoa</span>
              <span>{formatCurrency(details.valuePerPerson)}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Descrição</h3>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p>{event.type}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Nome:</span>
            <span className="font-medium">{event.title.split('-')[0].trim()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Email:</span>
            <div className="flex items-center gap-1 font-medium">
              <Mail className="h-4 w-4" />
              <span>{details.contactInfo?.email}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span>WhatsApp:</span>
            <div className="flex items-center gap-1 font-medium">
              <Phone className="h-4 w-4" />
              <span>{details.contactInfo?.whatsapp}</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span>Já conhece o espaço:</span>
            <span className="font-medium">
              {details.contactInfo?.hasVisitedVenue ? "Sim" : "Não"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Por onde nos conheceu:</span>
            <span className="font-medium">{details.contactInfo?.referralSource}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button>
          <ClipboardList className="mr-2 h-4 w-4" />
          Gerar Contrato
        </Button>
      </div>
    </div>
  );
}
