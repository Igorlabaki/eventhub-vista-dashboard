import { Venue } from "@/components/ui/venue-list";
import { Organization } from "./organization";
import { Attachment } from "./attachment";

export interface Clause {
  id: string;
  text: string;
  title: string;
  position: number;
  contractId: string;
}

export interface Contract {
  id: string;
  name: string;
  title: string;
  organizationId: string;
  organization: Organization;
  venues: Venue[];
  clauses: Clause[];
  attachments: Attachment[];
}

export interface CreateContractDTO {
  title: string;
  name: string;
  organizationId?: string;
  venueIds?: string[];
  clauses: {
    text: string;
    title: string;
    position: number;
  }[];
}

export interface UpdateContractDTO {
  title: string;
  name: string;
  contractId: string;
  venueIds: string[];
  clauses: {
    text: string;
    title: string;
    position: number;
    id?: string;
  }[];
}

export interface ListContractParams {
  organizationId: string;
  title?: string;
  venueId?: string;
}

export interface ContractByIdResponse {
  success: true;
  message: string;
  data: Contract;
  count: number;
  type: string;
}

export interface ContractListResponse {
  success: true;
  message: string;
  data: {
    contractList: Contract[];
  };
  count: number;
  type: string;
}

export interface ContractCreateResponse {
  success: true;
  message: string;
  data: Contract;
  count: number;
  type: string;
}

export interface ContractDeleteResponse {
  success: true;
  message: string;
  data: Contract;
  count: number;
  type: string;
}

export interface ContractUpdateResponse {
  success: true;
  message: string;
  data: Contract;
  count: number;
  type: string;
}

export type DynamicField =
  | "owner.completeName"
  | "owner.rg"
  | "owner.cpf"
  | "owner.pix"
  | "owner.street"
  | "owner.streetNumber"
  | "owner.complement"
  | "owner.neighborhood"
  | "owner.city"
  | "owner.state"
  | "owner.cep"
  | "venue.name"
  | "venue.email"
  | "venue.street"
  | "venue.streetNumber"
  | "venue.complement"
  | "venue.neighborhood"
  | "venue.city"
  | "venue.state"
  | "venue.cep"
  | "client.completeName"
  | "client.cep"
  | "client.cpf"
  | "client.cnpj"
  | "client.street"
  | "client.streetNumber"
  | "client.adressComplement"
  | "client.completeCompanyName"
  | "client.completeClientName"
  | "client.email"
  | "client.neighborhood"
  | "proposal.checkIn"
  | "proposal.checkOut"
  | "proposal.pricePerDay"
  | "proposal.pricePerPerson"
  | "proposal.maxGuests"
  | "proposal.guestNumber"
  | "proposal.startDate"
  | "proposal.endDate"
  | "proposal.basePrice"
  | "proposal.extraHours"
  | "proposal.extraHourPrice"
  | "proposal.totalPrice"
  | "proposal.totalAmount"
  | "paymentInfo.dueDate"
  | "paymentInfo.numberPayments"
  | "paymentInfo.signalAmount"
  | "paymentInfo.paymentValue"
  | "paymentInfo.perPersonPrice";

  
export interface DynamicFieldGroup {
  name: string;
  fields: Array<{
    id: DynamicField;
    label: string;
    display: string;
  }>;
}


  export const fieldGroups: DynamicFieldGroup[] = [
    {
      name: "Locação",
      fields: [
        { id: "venue.name", label: "Nome do Espaço", display: "NOME_LOCACAO" },
        { id: "venue.email", label: "Email", display: "EMAIL_LOCACAO" },
        { id: "venue.street", label: "Rua", display: "RUA_LOCACAO" },
        { id: "venue.streetNumber", label: "Número", display: "NUMERO_LOCACAO" },
        { id: "venue.complement", label: "Complemento", display: "COMPLEMENTO_LOCACAO" },
        { id: "venue.neighborhood", label: "Bairro", display: "BAIRRO_LOCACAO" },
        { id: "venue.city", label: "Cidade", display: "CIDADE_LOCACAO" },
        { id: "venue.state", label: "Estado", display: "ESTADO_LOCACAO" },
        { id: "venue.cep", label: "CEP", display: "CEP_LOCACAO" },
        { id: "proposal.checkIn", label: "Check In", display: "CHECK_IN" },
        { id: "proposal.checkOut", label: "Check Out", display: "CHECK_OUT" },
        { id: "proposal.pricePerDay", label: "Preço por Dia", display: "PRECO_POR_DIA" },
        { id: "proposal.pricePerPerson", label: "Preço por Pessoa", display: "PRECO_POR_PESSOA" },
        { id: "proposal.maxGuests", label: "Máx. de Convidados", display: "MAX_DE_CONVIDADOS" },
        { id: "proposal.totalAmount", label: "Valor Total", display: "VALOR_TOTAL" },
      ]
    },
    {
      name: "Proprietário",
      fields: [
        { id: "owner.completeName", label: "Nome Completo", display: "NOME_PROPRIETARIO" },
        { id: "owner.pix", label: "Pix", display: "PIX_PROPRIETARIO" },
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
        { id: "client.completeClientName", label: "Nome Completo", display: "NOME_CLIENTE" },
        { id: "client.cep", label: "CEP", display: "CEP_CLIENTE" },
        { id: "client.cpf", label: "CPF", display: "CPF_CLIENTE" },
        { id: "client.cnpj", label: "CNPJ", display: "CNPJ_CLIENTE" },
        { id: "client.street", label: "Rua", display: "RUA_CLIENTE" },
        { id: "client.streetNumber", label: "Número", display: "NUMERO_CLIENTE" },
        { id: "client.email", label: "Email", display: "EMAIL_CLIENTE" },
        { id: "client.adressComplement", label: "Complemento", display: "COMPLEMENTO_CLIENTE" },
        { id: "client.completeCompanyName", label: "Nome da Empresa", display: "NOME_EMPRESA" },
        { id: "client.neighborhood", label: "Bairro", display: "BAIRRO_CLINTE" },
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
        { id: "proposal.guestNumber", label: "Número de convidados", display: "NUMERO_CONVIDADOS" },
      ]
    },
    {
      name: "Pagamento",
      fields: [
        { id: "paymentInfo.dueDate", label: "Dia do vencimento da parcela", display: "DIA_VENCIMENTO_PARCELA" },
        { id: "paymentInfo.numberPayments", label: "Número de parcelas", display: "NUMERO_PARCELAS" },
        { id: "paymentInfo.signalAmount", label: "Valor do sinal", display: "VALOR_SINAL" },
        { id: "paymentInfo.paymentValue", label: "Valor da parcela", display: "VALOR_PARCELA" },
        { id: "paymentInfo.perPersonPrice", label: "Valor por pessoa", display: "VALOR_POR_PESSOA" },
      ]
    },
  ];