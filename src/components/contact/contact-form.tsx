import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Contact, ContactType } from "@/types/contact";
import { FormLayout } from "@/components/ui/form-layout";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useContactStore } from "@/store/contactStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import InputMask from "react-input-mask";

const contactFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  type: z.nativeEnum(ContactType).optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: ContactFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: contact?.name || "",
      role: contact?.role || "",
      whatsapp: contact?.whatsapp || "",
      email: contact?.email || "",
      type: contact?.type || ContactType.TEAM_MEMBER,
    },
  });

  const { deleteContact } = useContactStore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    form.reset({
      name: contact?.name || "",
      role: contact?.role || "",
      whatsapp: contact?.whatsapp || "",
      email: contact?.email || "",
      type: contact?.type || ContactType.TEAM_MEMBER,
    });
  }, [contact, form]);

  const handleDelete = async () => {
    if (!contact) return;
    setIsDeleting(true);
    try {
      const response = await deleteContact(contact.id, contact.venueId);
      const { title, message } = handleBackendSuccess(response, "Contato excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir contato. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FormLayout
      title={contact ? "Editar Contato" : "Novo Contato"}
      onSubmit={onSubmit}
      onCancel={onCancel}
      form={form}
      isEditing={!!contact}
      onDelete={contact ? handleDelete : undefined}
      entityName={contact?.name}
      entityType="contato"
      isDeleting={isDeleting}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Nome do contato" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Função</FormLabel>
            <FormControl>
              <Input placeholder="Função do contato" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="whatsapp"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp</FormLabel>
            <FormControl>
              <InputMask
                mask="(99) 99999-9999"
                value={field.value}
                onChange={field.onChange}
              >
                {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                  <Input placeholder="(00) 00000-0000" {...inputProps} />
                )}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="email@exemplo.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={ContactType.TEAM_MEMBER}>Membro da Equipe</SelectItem>
                <SelectItem value={ContactType.SUPPLIER}>Fornecedor</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
} 