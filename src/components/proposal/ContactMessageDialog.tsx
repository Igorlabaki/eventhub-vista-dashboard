import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { canSendWhatsApp, openWhatsAppChat } from "@/lib/whatsapp-link";
import { useProposalStore } from "@/store/proposalStore";
import { useUserStore } from "@/store/userStore";
import { useVenueStore } from "@/store/venueStore";

interface ContactMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function contactMessage(username?: string | null, venueName?: string | null) {
  return `Olá, sou ${username ?? ""}, do espaço ${venueName ?? ""}! Tudo bem com você?`;
}

export function ContactMessageFields({
  onSent,
  username,
  venueName,
  phone,
}: {
  onSent: () => void;
  username?: string | null;
  venueName?: string | null;
  phone?: string | null;
}) {
  const [message, setMessage] = useState(() => contactMessage(username, venueName));

  return (
    <>
      <DialogHeader>
        <DialogTitle>Entrar em contato</DialogTitle>
        <DialogDescription>Edite a mensagem e envie pelo WhatsApp.</DialogDescription>
      </DialogHeader>
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="min-h-[140px] resize-none"
        placeholder="Digite sua mensagem aqui..."
        aria-label="Mensagem para o cliente"
      />
      <div className="flex justify-end">
        <WhatsAppButton
          onClick={() => {
            if (!phone || !canSendWhatsApp(phone, message)) return;
            openWhatsAppChat(phone, message);
            onSent();
          }}
          label="Enviar via WhatsApp"
          disabled={!canSendWhatsApp(phone, message)}
        />
      </div>
    </>
  );
}

export function ContactMessageDialog({ open, onOpenChange }: ContactMessageDialogProps) {
  const { currentProposal } = useProposalStore();
  const { selectedVenue: venue } = useVenueStore();
  const { user } = useUserStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open ? (
          <ContactMessageFields
            onSent={() => onOpenChange(false)}
            username={user?.username}
            venueName={venue?.name}
            phone={currentProposal?.whatsapp}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
