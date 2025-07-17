import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FormLayout } from "@/components/ui/form-layout";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useProposalStore } from "@/store/proposalStore";
import { useUserStore } from "@/store/userStore";
import { useVenueStore } from "@/store/venueStore";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { parsePhoneNumberFromString } from 'libphonenumber-js'
type FormValues = {
  message: string;
};

export default function SendMessagePage() {
  const { id } = useParams();
  const { currentProposal } = useProposalStore();
  const { selectedVenue: venue } = useVenueStore();
  const { user } = useUserStore();
  const form = useForm<FormValues>({
    defaultValues: {
      message: `Olá, sou ${user?.username}, do espaço ${venue?.name}! Tudo bem com você?`,
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

  return (
    <DashboardLayout title="Enviar Mensagem" subtitle="Envie uma mensagem para o cliente">
      <FormLayout
        title="Mensagem para o Cliente"
        form={form}
        onSubmit={onSubmit}
        onCancel={() => window.history.back()}
        submitLabel="Enviar via WhatsApp"
        customSubmitButton={
          <WhatsAppButton
            onClick={form.handleSubmit(onSubmit)}
            label="Enviar via WhatsApp"
            disabled={!currentProposal?.whatsapp}
          />
        }
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[150px] resize-none"
                  placeholder="Digite sua mensagem aqui..."
                />
              </FormControl>
            </FormItem>
          )}
        />
      </FormLayout>
    </DashboardLayout>
  );
} 