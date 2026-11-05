import { useEffect, useRef, useState } from "react";
import { useProposalStore } from "@/store/proposalStore";
import { handleBackendError } from "@/lib/error-handler";
import { useForm } from "react-hook-form";
import { requiredProposalEmail } from "./required-proposal-email";
import type { PublicListSurface } from "@/components/proposal/PublicVenueListShell";
import { ContractPublicField } from "./ContractPublicField";
import { PublicContractFormCard, type ContractSaveNotice } from "./PublicContractFormCard";

const LEAD = "Informe os dados de quem assina este contrato.";

export default function PFContractPersonalInfoForm({ surface }: { surface: PublicListSurface }) {
  const { currentProposal, updateProposalPersonalInfo } = useProposalStore();
  const [notice, setNotice] = useState<ContractSaveNotice>(null);
  const [submitting, setSubmitting] = useState(false);
  const savedValues = useRef<string | null>(null);

  const form = useForm({
    defaultValues: {
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
      email: currentProposal?.email || "",
    },
  });

  const onSubmit = async (values: {
    completeClientName: string;
    cpf: string;
    rg: string;
    street: string;
    streetNumber: string;
    adressComplement: string;
    neighborhood: string;
    cep: string;
    city: string;
    state: string;
    email: string;
  }) => {
    const emailResult = requiredProposalEmail(values.email);
    if (!emailResult.ok) {
      savedValues.current = null;
      setNotice(null);
      form.setError("email", { type: "manual", message: emailResult.message });
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      const dataToUpdate = {
        proposalId: currentProposal?.id,
        data: {
          email: emailResult.email,
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

      await updateProposalPersonalInfo(dataToUpdate);
      savedValues.current = JSON.stringify(values);
      setNotice({ kind: "saved" });
    } catch (error: unknown) {
      const { message } = handleBackendError(
        error,
        "Não foi possível salvar. Tente de novo em instantes."
      );
      savedValues.current = JSON.stringify(values);
      setNotice({ kind: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!savedValues.current) return;
      if (JSON.stringify(values) !== savedValues.current) {
        savedValues.current = null;
        setNotice(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const isFormUnchanged = () => {
    if (!currentProposal) return false;
    const formValues = form.getValues();
    const initial = {
      completeClientName: currentProposal.completeClientName || "",
      cpf: currentProposal.cpf || "",
      rg: currentProposal.rg || "",
      street: currentProposal.street || "",
      streetNumber: currentProposal.streetNumber || "",
      adressComplement: currentProposal.adressComplement || "",
      neighborhood: currentProposal.neighborhood || "",
      cep: currentProposal.cep || "",
      city: currentProposal.city || "São Paulo",
      state: currentProposal.state || "SP",
      email: currentProposal.email || "",
    };
    return (Object.keys(initial) as (keyof typeof initial)[]).every(
      (key) => formValues[key] === initial[key]
    );
  };

  const inputClassName = surface.inputClassName;

  return (
    <PublicContractFormCard
      surface={surface}
      title="Dados da Pessoa Física"
      lead={LEAD}
      form={form}
      onSubmit={onSubmit}
      submitDisabled={isFormUnchanged()}
      submitting={submitting}
      notice={notice}
    >
      <ContractPublicField control={form.control} name="completeClientName" label="Nome Completo" inputClassName={inputClassName} />
      <ContractPublicField control={form.control} name="email" label="E-mail" inputClassName={inputClassName} type="email" placeholder="email@cliente.com" />
      <ContractPublicField control={form.control} name="cpf" label="CPF" inputClassName={inputClassName} mask="999.999.999-99" placeholder="Digite o CPF" />
      <ContractPublicField control={form.control} name="rg" label="RG" inputClassName={inputClassName} mask="99.999.999-9" placeholder="Digite o RG" />
      <ContractPublicField control={form.control} name="street" label="Logradouro" inputClassName={inputClassName} />
      <ContractPublicField control={form.control} name="streetNumber" label="Número" inputClassName={inputClassName} />
      <ContractPublicField control={form.control} name="adressComplement" label="Complemento" inputClassName={inputClassName} />
      <ContractPublicField control={form.control} name="neighborhood" label="Bairro" inputClassName={inputClassName} />
      <ContractPublicField control={form.control} name="cep" label="CEP" inputClassName={inputClassName} mask="99999-999" placeholder="Digite o CEP" />
      <ContractPublicField control={form.control} name="city" label="Cidade" inputClassName={inputClassName} />
      <ContractPublicField control={form.control} name="state" label="Estado" inputClassName={inputClassName} maxLength={2} />
    </PublicContractFormCard>
  );
}
