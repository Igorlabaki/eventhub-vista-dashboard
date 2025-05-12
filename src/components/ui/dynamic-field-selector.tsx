
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DynamicField } from "@/types/contract"

interface DynamicFieldGroup {
  name: string;
  fields: Array<{
    id: DynamicField;
    label: string;
  }>;
}

const fieldGroups: DynamicFieldGroup[] = [
  {
    name: "Locação",
    fields: [
      { id: "venue.name", label: "Nome do Espaço" },
      { id: "proposal.checkIn", label: "Check In" },
      { id: "proposal.checkOut", label: "Check Out" },
      { id: "proposal.pricePerDay", label: "Preço por Dia" },
      { id: "proposal.pricePerPerson", label: "Preço por Pessoa" },
      { id: "proposal.maxGuests", label: "Máx. de Convidados" },
    ]
  },
  {
    name: "Proprietário",
    fields: [
      { id: "owner.completeName", label: "Nome Completo" },
      { id: "owner.rg", label: "RG" },
      { id: "owner.cpf", label: "CPF" },
      { id: "owner.street", label: "Rua" },
      { id: "owner.streetNumber", label: "Número" },
      { id: "owner.complement", label: "Complemento" },
      { id: "owner.neighborhood", label: "Bairro" },
      { id: "owner.city", label: "Cidade" },
      { id: "owner.state", label: "Estado" },
      { id: "owner.cep", label: "CEP" },
    ]
  },
  {
    name: "Cliente",
    fields: [
      { id: "client.name", label: "Nome Completo" },
      { id: "client.cpf", label: "CPF" },
      { id: "client.cnpj", label: "CNPJ" },
      { id: "client.street", label: "Rua" },
      { id: "client.streetNumber", label: "Número" },
      { id: "client.email", label: "Email" },
    ]
  },
  {
    name: "Proposta",
    fields: [
      { id: "proposal.startDate", label: "Dia do Início" },
      { id: "proposal.endDate", label: "Dia do Final" },
      { id: "proposal.basePrice", label: "Preço Base" },
      { id: "proposal.extraHours", label: "Quantidade de horas extras" },
      { id: "proposal.extraHourPrice", label: "Preço da hora extra" },
      { id: "proposal.totalPrice", label: "Preço total" },
      { id: "proposal.guestCount", label: "Número de convidados" },
    ]
  },
  {
    name: "Pagamento",
    fields: [
      { id: "payment.installmentDay", label: "Dia do vencimento da parcela" },
      { id: "payment.installmentCount", label: "Número de parcelas" },
      { id: "payment.downPayment", label: "Valor do sinal" },
      { id: "payment.installmentValue", label: "Valor da parcela" },
    ]
  },
];

interface DynamicFieldSelectorProps {
  onSelectField: (field: DynamicField) => void;
}

export function DynamicFieldSelector({ onSelectField }: DynamicFieldSelectorProps) {
  // Add stop propagation to prevent modal from closing
  const handleButtonClick = (field: DynamicField) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectField(field)
  }

  return (
    <Tabs defaultValue={fieldGroups[0].name} className="w-full">
      <TabsList className="grid grid-cols-5 mb-4" onClick={(e) => e.stopPropagation()}>
        {fieldGroups.map((group) => (
          <TabsTrigger 
            key={group.name} 
            value={group.name} 
            className="text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {group.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {fieldGroups.map((group) => (
        <TabsContent 
          key={group.name} 
          value={group.name} 
          className="mt-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-2">
            {group.fields.map((field) => (
              <Button
                key={field.id}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleButtonClick(field.id)}
              >
                {field.label}
              </Button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
