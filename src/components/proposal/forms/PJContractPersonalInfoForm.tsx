import { FormMessage } from "@/components/ui/form";
import { FormControl } from "@/components/ui/form";
import { FormField, FormLabel } from "@/components/ui/form";
import { FormItem } from "@/components/ui/form";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useProposalStore } from "@/store/proposalStore";
import React from "react";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useForm } from "react-hook-form";
import InputMask from "react-input-mask";

export default function PJContractPersonalInfoForm() {
  const { toast } = useToast();
  const { currentProposal, updateProposalPersonalInfo } = useProposalStore();

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
      formValues.street === currentProposal.street &&
      formValues.streetNumber === currentProposal.streetNumber &&
      formValues.neighborhood === currentProposal.neighborhood &&
      formValues.cep === currentProposal.cep &&
      formValues.city === currentProposal.city &&
      formValues.state === currentProposal.state &&
      formValues.adressComplement === currentProposal.adressComplement
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
    },
  });

  return (
    <FormLayout
      title="Dados da Pessoa Jurídica"
      onSubmit={onSubmit}
      form={form}
      submitLabel="Salvar Alterações"
      customSubmitButton={
        <button
          type="submit"
          disabled={isFormUnchanged()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Salvar Alterações
        </button>
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
    </FormLayout>
  );
} 