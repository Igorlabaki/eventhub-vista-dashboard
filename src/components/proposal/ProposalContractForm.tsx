import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useProposalStore } from "@/store/proposalStore";
import { useOwnerStore } from "@/store/ownerStore";
import { useContractStore } from "@/store/contractStore";
import { useForm } from "react-hook-form";
import { FormLayout } from "@/components/ui/form-layout";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Owner } from "@/types/owner";
import { useOrganizationStore } from "@/store/organizationStore";
import { useVenueStore } from "@/store/venueStore";

import { useToast } from "@/hooks/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import jsPDF from "jspdf";
import extenso from "extenso";
import { parseISO, isValid, format } from "date-fns";
import PFContractForm from "./forms/pf-contract-form";
import PJContractForm from "./forms/pj-contract-form";


export function ProposalContractForm() {
  const { toast } = useToast();
  const [formType, setFormType] = useState<"Pessoa Fisica" | "Pessoa Juridica">("Pessoa Fisica");
  const { currentProposal, updateProposalPersonalInfo } = useProposalStore();
  const { selectedVenue } = useVenueStore();
  const { ownersByVenueId, fetchOwnersByVenueId, isLoading: isLoadingOwners } = useOwnerStore();
  const { venueContracts, fetchVenueContracts, isLoading: isLoadingContracts } = useContractStore();

  const { currentOrganization } = useOrganizationStore();

  useEffect(() => {
    if (selectedVenue?.id) {
      fetchOwnersByVenueId({ 
        venueId: selectedVenue?.id,
        organizationId: currentOrganization?.id
      });
      fetchVenueContracts({ 
        venueId: selectedVenue?.id,
        organizationId: currentOrganization?.id
      });
    }
  }, [currentProposal?.venueId, currentProposal?.organizationId, fetchOwnersByVenueId, fetchVenueContracts]);

 
  return (
    <DashboardLayout title="Enviar Contrato" subtitle="Envie ou gerencie o contrato desta proposta.">
      <div className="bg-white rounded-lg shadow p-6">
       

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Qual o tipo de contrato?</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formType === "Pessoa Fisica"}
                onChange={() => setFormType("Pessoa Fisica")}
                className="mr-2"
              />
              <span>Pessoa Fisica</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={formType === "Pessoa Juridica"}
                onChange={() => setFormType("Pessoa Juridica")}
                className="mr-2"
              />
              <span>Pessoa Juridica</span>
            </label>
          </div>
        </div>

        {formType === "Pessoa Fisica" ? (
          <PFContractForm />
        ) : (
          <PJContractForm />
        )}
      </div>
    </DashboardLayout>
  );
} 