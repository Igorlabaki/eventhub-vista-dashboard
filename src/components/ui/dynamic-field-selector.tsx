import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DynamicField } from "@/types/contract"

interface DynamicFieldGroup {
  name: string;
  fields: Array<{
    id: DynamicField;
    label: string;
    display: string;
  }>;
}

const fieldGroups: DynamicFieldGroup[] = [
  {
    name: "Locação",
    fields: [
      { id: "venue.name", label: "Nome do Espaço", display: "NOME_DA_LOCACAO" },
      { id: "proposal.checkIn", label: "Check In", display: "CHECK_IN" },
      { id: "proposal.checkOut", label: "Check Out", display: "CHECK_OUT" },
      { id: "proposal.pricePerDay", label: "Preço por Dia", display: "PRECO_POR_DIA" },
      { id: "proposal.pricePerPerson", label: "Preço por Pessoa", display: "PRECO_POR_PESSOA" },
      { id: "proposal.maxGuests", label: "Máx. de Convidados", display: "MAX_DE_CONVIDADOS" },
    ]
  },
  {
    name: "Proprietário",
    fields: [
      { id: "owner.completeName", label: "Nome Completo", display: "NOME_PROPRIETARIO" },
      { id: "owner.rg", label: "RG", display: "RG_PROPRIETARIO" },
      { id: "owner.cpf", label: "CPF", display: "CPF_PROPRIETARIO" },
      { id: "owner.street", label: "Rua", display: "RUA_PROPRIETARIO" },
      { id: "owner.streetNumber", label: "Número", display: "NUMERO_PROPRIETARIO" },
      { id: "owner.complement", label: "Complemento", display: "COMPLEMENTO_PROPRIETARIO" },
      { id: "owner.neighborhood", label: "Bairro", display: "BAIRRO_PROPRIETARIO" },
      { id: "owner.city", label: "Cidade", display: "CIDADE_PROPRIETARIO" },
      { id: "owner.state", label: "Estado", display: "ESTADO_PROPRIETARIO" },
      { id: "owner.cep", label: "CEP", display: "CEP_PROPRIETARIO" },
    ]
  },
  {
    name: "Cliente",
    fields: [
      { id: "client.name", label: "Nome Completo", display: "NOME_CLIENTE" },
      { id: "client.cpf", label: "CPF", display: "CPF_CLIENTE" },
      { id: "client.cnpj", label: "CNPJ", display: "CNPJ_CLIENTE" },
      { id: "client.street", label: "Rua", display: "RUA_CLIENTE" },
      { id: "client.streetNumber", label: "Número", display: "NUMERO_CLIENTE" },
      { id: "client.email", label: "Email", display: "EMAIL_CLIENTE" },
    ]
  },
  {
    name: "Proposta",
    fields: [
      { id: "proposal.startDate", label: "Dia do Início", display: "DIA_INICIO" },
      { id: "proposal.endDate", label: "Dia do Final", display: "DIA_FINAL" },
      { id: "proposal.basePrice", label: "Preço Base", display: "PRECO_BASE" },
      { id: "proposal.extraHours", label: "Quantidade de horas extras", display: "QTD_HORAS_EXTRAS" },
      { id: "proposal.extraHourPrice", label: "Preço da hora extra", display: "PRECO_HORA_EXTRA" },
      { id: "proposal.totalPrice", label: "Preço total", display: "PRECO_TOTAL" },
      { id: "proposal.guestCount", label: "Número de convidados", display: "NUMERO_CONVIDADOS" },
    ]
  },
  {
    name: "Pagamento",
    fields: [
      { id: "payment.installmentDay", label: "Dia do vencimento da parcela", display: "DIA_VENCIMENTO_PARCELA" },
      { id: "payment.installmentCount", label: "Número de parcelas", display: "NUMERO_PARCELAS" },
      { id: "payment.downPayment", label: "Valor do sinal", display: "VALOR_SINAL" },
      { id: "payment.installmentValue", label: "Valor da parcela", display: "VALOR_PARCELA" },
    ]
  },
];

interface DynamicFieldSelectorProps {
  onSelectField: (field: DynamicField, display: string) => void;
}

export function DynamicFieldSelector({ onSelectField }: DynamicFieldSelectorProps) {
  // Add stop propagation to prevent modal from closing
  const handleButtonClick = (field: DynamicField, display: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectField(field, display)
  }

  return (

      <Tabs defaultValue={fieldGroups[0].name} className="w-full">
        <TabsList className="flex flex-wrap gap-2  bg-transparent p-0 border-none mb-10 md:mb-4">
          {fieldGroups.map((group) => (
            <TabsTrigger 
              key={group.name} 
              value={group.name} 
              className="px-3 py-1 rounded-lg border bg-white shadow-sm text-violet-700 font-semibold transition-colors data-[state=active]:bg-violet-100 data-[state=active]:border-violet-500 data-[state=active]:text-violet-900 text-xs"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {group.fields.map((field) => (
                <Button
                  key={field.id}
                  variant="outline"
                  size="sm"
                  className="px-3 py-2 rounded-lg bg-white border shadow-sm hover:bg-violet-50 transition font-medium text-xs"
                  onClick={handleButtonClick(field.id, field.display)}
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
