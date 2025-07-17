import { SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { FormMessage } from "@/components/ui/form";
import { FormControl } from "@/components/ui/form";
import { FormField, FormLabel } from "@/components/ui/form";
import { FormItem } from "@/components/ui/form";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useContractStore } from "@/store/contractStore";
import { useOwnerStore } from "@/store/ownerStore";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import React from "react";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useForm } from "react-hook-form";
import { Select } from "@/components/ui/select";
import InputMask from "react-input-mask";
import { generateContractPdf } from "./ContractPdfGenerator";


export default function PJContractForm() {
  const { ownersByVenueId, isLoading: isLoadingOwners } = useOwnerStore();
  const { venueContracts, isLoading: isLoadingContracts } = useContractStore();
  const { toast } = useToast();
  const { currentProposal, updateProposalPersonalInfo } = useProposalStore();
  const { selectedVenue } = useVenueStore();

  const onSubmit = async (values) => {
    try {
      const dataToUpdate = {
        proposalId: currentProposal?.id,
        data: {
          completeCompanyName: values.completeCompanyName,
          cnpj: values.cnpj,
          completeClientName: values.completeClientName,
          cpf: values.cpf,
          rg: values.rg,
          street: values.street,
          streetNumber: values.streetNumber,
          neighborhood: values.neighborhood,
          cep: values.cep,
          city: values.city,
          state: values.state,
          adressComplement: values.adressComplement,
        },
      };

      const response = await updateProposalPersonalInfo(dataToUpdate);
      const { title, message } = handleBackendSuccess(
        response,
        "Dados pessoais atualizados com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao atualizar dados pessoais. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const isFormUnchanged = () => {
    if (!currentProposal) return false;

    const formValues = form.getValues();
    return (
      formValues.completeCompanyName === currentProposal.completeCompanyName &&
      formValues.cnpj === currentProposal.cnpj &&
      formValues.completeClientName === currentProposal.completeClientName &&
      formValues.cpf === currentProposal.cpf &&
      formValues.rg === currentProposal.rg &&
      formValues.adressComplement === currentProposal.adressComplement &&
      formValues.street === currentProposal.street &&
      formValues.streetNumber === currentProposal.streetNumber &&
      formValues.neighborhood === currentProposal.neighborhood &&
      formValues.cep === currentProposal.cep &&
      formValues.city === currentProposal.city &&
      formValues.state === currentProposal.state
    );
  };

  const form = useForm({
    defaultValues: {
      completeCompanyName: currentProposal?.completeCompanyName || "",
      cnpj: currentProposal?.cnpj || "",
      completeClientName: currentProposal?.completeClientName || "",
      cpf: currentProposal?.cpf || "",
      rg: currentProposal?.rg || "",
      street: currentProposal?.street || "",
      streetNumber: currentProposal?.streetNumber || "",
      adressComplement: currentProposal?.adressComplement || "",
      neighborhood: currentProposal?.neighborhood || "",
      cep: currentProposal?.cep || "",
      city: currentProposal?.city || "São Paulo",
      state: currentProposal?.state || "SP",
      paymentMethod: "vista",
      paymentInfo: {
        signalAmount: currentProposal?.totalAmount
          ? String(currentProposal.totalAmount / 2)
          : "",
        numberPayments: "2",
        dueDate: "5",
      },
      ownerId: "",
      contractId: "",
    },
  });

  const isFormComplete = () => {
    const values = form.getValues();
    return (
      values.completeCompanyName &&
      values.cnpj &&
      values.completeClientName &&
      values.cpf &&
      values.street &&
      values.streetNumber &&
      values.neighborhood &&
      values.cep &&
      values.city &&
      values.state &&
      values.paymentMethod &&
      values.ownerId &&
      values.contractId &&
      (values.paymentMethod === "vista" ||
        (values.paymentMethod === "parcelado" &&
          values.paymentInfo.signalAmount &&
          values.paymentInfo.numberPayments &&
          values.paymentInfo.dueDate))
    );
  };

  return (
    <FormLayout
      title="Pessoa Jurídica"
      onSubmit={onSubmit}
      form={form}
      submitLabel="Salvar Alterações"
      customSubmitButton={
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isFormUnchanged()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Salvar Alterações
          </button>
          <button
            type="button"
            onClick={() =>
              generateContractPdf({
                contract: venueContracts.find(
                  (contract) => contract.id === form.getValues().contractId
                ),
                owner: ownersByVenueId.find(
                  (owner) => owner.id === form.getValues().ownerId
                ),
                currentProposal,
                selectedVenue,
                formValues: form.getValues(),
                toast: (args) =>
                  toast({
                    ...args,
                    variant: args.variant as "default" | "destructive",
                  }),
                paymentInfo: {
                  amount: currentProposal?.totalAmount || 0,
                  dueDate: form.getValues().paymentInfo.dueDate,
                  paymentMethod: form.getValues().paymentMethod,
                  paymentValue: String(currentProposal?.totalAmount / Number(form.getValues().paymentInfo.numberPayments)),
                  numberPayments: form.getValues().paymentInfo.numberPayments,
                  signalAmount: form.getValues().paymentInfo.signalAmount,
                  perPersonPrice: String(currentProposal?.totalAmount / currentProposal?.guestNumber),
                },
              })
            }
            disabled={!isFormComplete()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
          >
            Gerar Contrato
          </button>
        </div>
      }
    >
      <FormField
        control={form.control}
        name="completeCompanyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Empresa</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cnpj"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CNPJ</FormLabel>
            <FormControl>
              <InputMask
                mask="99.999.999/9999-99"
                placeholder="Digite o CNPJ"
                value={field.value}
                onChange={field.onChange}
              >
                {(inputProps) => <Input {...inputProps} />}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="completeClientName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF</FormLabel>
            <FormControl>
              <InputMask
                mask="999.999.999-99"
                placeholder="Digite o CPF"
                value={field.value}
                onChange={field.onChange}
              >
                {(inputProps) => <Input {...inputProps} />}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="rg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RG</FormLabel>
            <FormControl>
              <InputMask
                mask="99.999.999-9"
                placeholder="Digite o RG"
                value={field.value}
                onChange={field.onChange}
              >
                {(inputProps) => <Input {...inputProps} />}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logradouro</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="streetNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="adressComplement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="neighborhood"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <InputMask
                mask="99999-999"
                placeholder="Digite o CEP"
                value={field.value}
                onChange={field.onChange}
              >
                {(inputProps) => <Input {...inputProps} />}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <FormControl>
              <Input {...field} maxLength={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Método de Pagamento</FormLabel>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={field.value === "vista"}
                  onChange={() => field.onChange("vista")}
                  className="mr-2"
                />
                <span>A vista</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={field.value === "parcelado"}
                  onChange={() => field.onChange("parcelado")}
                  className="mr-2"
                />
                <span>Parcelado</span>
              </label>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("paymentMethod") === "parcelado" && (
        <>
          <FormField
            control={form.control}
            name="paymentInfo.signalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do Sinal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentInfo.numberPayments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Parcelas</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentInfo.dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia do Limite para Pagamento</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <FormField
        control={form.control}
        name="ownerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proprietário</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoadingOwners}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um proprietário" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ownersByVenueId?.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.completeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contractId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contrato</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoadingContracts}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contrato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {venueContracts?.map((contract) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    {contract.name || `Contrato ${contract.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
}
