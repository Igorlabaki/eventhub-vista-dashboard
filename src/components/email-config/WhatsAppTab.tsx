import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Proposal } from "@/types/proposal";
import { UseFormReturn } from "react-hook-form";

interface WhatsAppTabProps {
  proposal: Proposal | null;
  venueUrl?: string;
  venueName?: string;
  form: UseFormReturn<{
    message: string;
    file?: File | null;
  }>;
}

export function WhatsAppTab({ proposal, venueUrl, venueName, form }: WhatsAppTabProps) {
  return (
    <FormField
      control={form.control}
      name="message"
      render={({ field }) => (
        <FormItem className="flex-1 flex flex-col">
          <FormControl className="flex-1">
            <Textarea
              {...field}
              className="h-full min-h-[500px] resize-none"
              placeholder="Digite sua mensagem aqui..."
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
} 