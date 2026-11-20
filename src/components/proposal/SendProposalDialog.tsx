import { useState } from "react";
import { useForm } from "react-hook-form";
import { EmailTab } from "@/components/email-config/EmailTab";
import { SendProposalHeader } from "@/components/email-config/SendProposalHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { proposalClientUrl } from "@/lib/proposal-public-url";
import { canSendWhatsApp, openWhatsAppChat } from "@/lib/whatsapp-link";
import { useProposalStore } from "@/store/proposalStore";
import { useUserStore } from "@/store/userStore";
import { useVenueStore } from "@/store/venueStore";

interface SendProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  message: string;
  file?: File | null;
};

export function proposalShareMessage(input: {
  clientName?: string | null;
  proposalId?: string | null;
  venueName?: string | null;
  publicCode?: string | null;
}) {
  const link = proposalClientUrl({
    proposalId: input.proposalId ?? "",
    venueName: input.venueName,
    clientName: input.clientName,
    publicCode: input.publicCode,
  });

  return `Olá ${input.clientName ?? ""},\n\nVimos que você fez um orçamento conosco para seu evento e estamos 
      muito felizes em saber que a nossa casa de eventos te chamou a atenção. ✨\n\nAqui está o link para o seu 
      orçamento:\n\n${link}\n\n
      Para que você possa ter a certeza de que o espaço ${input.venueName ?? ""} é o local perfeito para realizar o seu grande dia, gostaríamos
       de te convidar para uma visita sem compromisso!\n\nAtenciosamente,\nEquipe ${input.venueName ?? ""}`;
}

export function SendProposalFields({
  onSent,
  activeTab,
  onTabChange,
}: {
  onSent: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const { currentProposal } = useProposalStore();
  const { selectedVenue: venue } = useVenueStore();
  const { user } = useUserStore();
  const form = useForm<FormValues>({
    defaultValues: {
      message: proposalShareMessage({
        clientName: currentProposal?.completeClientName,
        proposalId: currentProposal?.id,
        venueName: venue?.name,
        publicCode: currentProposal?.publicCode,
      }),
      file: null,
    },
  });
  const message = form.watch("message");
  const phone = currentProposal?.whatsapp;

  if (!currentProposal || !venue || !user) {
    return (
      <DialogHeader>
        <DialogTitle>Enviar Orçamento</DialogTitle>
        <DialogDescription>Não foi possível carregar os dados do orçamento.</DialogDescription>
      </DialogHeader>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Enviar Orçamento</DialogTitle>
        <DialogDescription>Edite a mensagem e envie pelo WhatsApp ou por e-mail.</DialogDescription>
      </DialogHeader>
      <SendProposalHeader activeTab={activeTab} onTabChange={onTabChange} />
      <Tabs value={activeTab}>
        <TabsContent value="whatsapp">
          <Textarea
            {...form.register("message")}
            className="min-h-[160px] resize-none"
            placeholder="Digite sua mensagem aqui..."
            aria-label="Mensagem do orçamento"
          />
          <div className="mt-4 flex justify-end">
            <WhatsAppButton
              onClick={() => {
                const text = form.getValues("message");
                if (!canSendWhatsApp(phone, text)) return;
                openWhatsAppChat(phone || "", text);
                onSent();
              }}
              label="Enviar"
              disabled={!canSendWhatsApp(phone, message)}
            />
          </div>
        </TabsContent>
        <TabsContent value="email">
          <EmailTab
            proposal={currentProposal}
            venueUrl={venue.url ?? undefined}
            venueName={venue.name}
            form={form}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

export function SendProposalDialog({ open, onOpenChange }: SendProposalDialogProps) {
  const [activeTab, setActiveTab] = useState("whatsapp");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setActiveTab("whatsapp");
        onOpenChange(next);
      }}
    >
      <DialogContent
        className={
          activeTab === "email"
            ? "max-h-[85vh] max-w-4xl overflow-y-auto"
            : "max-w-lg"
        }
      >
        {open ? (
          <SendProposalFields
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSent={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
