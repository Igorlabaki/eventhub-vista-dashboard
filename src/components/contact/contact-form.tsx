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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const contactFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  whatsapp: z.string()
    .min(10, "WhatsApp é obrigatório")
    .refine((val) => {
      const onlyNumbers = val.replace(/\D/g, "");
      // Deve ter entre 10 e 13 dígitos (Brasil)
      if (onlyNumbers.length < 10 || onlyNumbers.length > 13) return false;
      // Não pode ser sequência repetida (ex: 99999999999, 11111111111)
      if (/^(\d)\1{7,}$/.test(onlyNumbers)) return false;
      // Não pode começar com 0
      if (/^0/.test(onlyNumbers)) return false;
      // Não pode ser só DDD (ex: 11999999999 é válido, 1199999999 é inválido)
      return true;
    }, {
      message: "Número de WhatsApp inválido",
    }),
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
      email: contact?.email || undefined,
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
              <PhoneInput
                country={"br"}
                value={field.value}
                onChange={field.onChange}
                inputClass="w-full"
                placeholder="Digite o número"
                enableSearch={true}
                containerClass="w-full"
                inputStyle={{ width: "100%" }}
              />
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