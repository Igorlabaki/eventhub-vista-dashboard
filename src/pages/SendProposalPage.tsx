import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FormLayout } from "@/components/ui/form-layout";
import { WhatsAppTab } from "@/components/email-config/WhatsAppTab";
import { EmailTab } from "@/components/email-config/EmailTab";
import { SendProposalHeader } from "@/components/email-config/SendProposalHeader";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Proposal } from "@/types/proposal";
import { useEmailConfigStore } from "@/store/emailConfigStore";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { CreateEmailConfigWithFileDTO } from "@/services/emailConfig.service";
import { parsePhoneNumberFromString } from 'libphonenumber-js'
type FormValues = {
  message: string;
  file?: File | null;
};

export default function SendProposalPage() {
  const { id } = useParams();
  const { currentProposal } = useProposalStore();
  const { selectedVenue: venue } = useVenueStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("whatsapp");
  const { createEmailConfig } = useEmailConfigStore();
  const form = useForm<FormValues>({
    defaultValues: {
      message: `Olá ${currentProposal?.completeClientName},\n\nVimos que você fez um orçamento conosco para seu evento e estamos 
      muito felizes em saber que a nossa casa de eventos te chamou a atenção. ✨\n\nAqui está o link para o seu 
      orçamento:\n\n${`https://event-hub-dashboard.vercel.app/proposal/${currentProposal?.id}/view`}\n\n
      Para que você possa ter a certeza de que o espaço ${venue?.name} é o local perfeito para realizar o seu grande dia, gostaríamos
       de te convidar para uma visita sem compromisso!\n\nAtenciosamente,\nEquipe ${venue?.name}`,
      file: null,
    },
  });

  const onSubmit = (values: FormValues) => {
    const numeroOriginal = currentProposal.whatsapp || "";
    const numeroLimpo = numeroOriginal.replace(/\D/g, "");
  
    const numeroComPlus = numeroOriginal.startsWith('+') ? numeroOriginal : `+${numeroLimpo}`;
    const phoneNumber = parsePhoneNumberFromString(numeroComPlus);
  
    const numeroFinal = phoneNumber && phoneNumber.isValid()
      ? phoneNumber.number.replace('+', '')  // remove "+"
      : `55${numeroLimpo}`; // fallback to Brazil
  
    const link = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(values.message)}`;
    window.open(link, "whatsapp");
  };

  const onSubmitEmail = async (values: FormValues) => {
    try {
      if (!venue?.id || !user?.id) {
        toast.error("Dados necessários não encontrados");
        return;
      }

      const emailConfigData: CreateEmailConfigWithFileDTO = {
        title: `PROPOSAL - ${venue.name}`,
        type: "PROPOSAL" as const,
        message: values.message,
        venueId: venue.id,
        file: values.file || undefined,
      };

      await createEmailConfig(emailConfigData);
      await emailService.sendProposal({
        proposal: {
          proposalId: currentProposal?.id || "",
          clientName: currentProposal?.completeClientName || "",
          clientEmail: currentProposal?.email || "",
        },
        message: values.message,
        userId: user.id,
        username: user.username || "",
        venueId: venue.id,
      });
      toast.success("Orçamento enviado por email com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar orçamento por email");
    }
  };

  if (!id || !currentProposal || !venue || !user) {
    return null;
  }

  return (
    <DashboardLayout
      title="Enviar Orçamento"
      subtitle="Envie o orçamento para o cliente via WhatsApp ou email"
    >
      <div className="space-y-6">
        <SendProposalHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <Tabs value={activeTab}>
          <TabsContent value="whatsapp">
            <FormLayout
              form={form}
              title="Mensagem do Orçamento"
              onSubmit={
                activeTab === "whatsapp" ? onSubmit : onSubmitEmail
              }
              onCancel={() => window.history.back()}
              submitLabel="Enviar"
            >
              <WhatsAppTab
                proposal={currentProposal}
                venueUrl={venue.url}
                venueName={venue.name}
                form={form}
              />
            </FormLayout>
          </TabsContent>

          <TabsContent value="email">
            <EmailTab
              proposal={currentProposal}
              venueUrl={venue.url}
              venueName={venue.name}
              form={form}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
