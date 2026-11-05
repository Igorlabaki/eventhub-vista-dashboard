import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Contact, ContactType } from "@/types/contact";
import { PARTNER_CATEGORIES, PARTNER_CATEGORY_LABELS } from "@/lib/partner-category";
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
import { supplierContactWrite } from "@/lib/supplier-contact-write";
import { Textarea } from "@/components/ui/textarea";

const contactFormSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  type: z.nativeEnum(ContactType).optional(),
  category: z.enum(PARTNER_CATEGORIES).optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  url: z.string().optional(),
  description: z.string().max(400, "A descrição passa de 400 caracteres").optional(),
}).superRefine((value, ctx) => {
  if (value.type === ContactType.SUPPLIER && !value.category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["category"],
      message: "Selecione a categoria",
    });
  }
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: ContactFormValues, extra?: { file?: File; removeLogo?: boolean }) => Promise<void>;
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
      category: contact?.category || undefined,
      instagramUrl: contact?.instagramUrl || "",
      facebookUrl: contact?.facebookUrl || "",
      tiktokUrl: contact?.tiktokUrl || "",
      url: contact?.url || "",
      description: contact?.description || "",
    },
  });

  const { deleteContact } = useContactStore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    form.reset({
      name: contact?.name || "",
      role: contact?.role || "",
      whatsapp: contact?.whatsapp || "",
      email: contact?.email || "",
      type: contact?.type || ContactType.TEAM_MEMBER,
      category: contact?.category || undefined,
      instagramUrl: contact?.instagramUrl || "",
      facebookUrl: contact?.facebookUrl || "",
      tiktokUrl: contact?.tiktokUrl || "",
      url: contact?.url || "",
      description: contact?.description || "",
    });
    setLogoFile(null);
    setRemoveLogo(false);
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

  const contactType = form.watch("type");

  const handleSubmit = async (data: ContactFormValues) => {
    const submission = supplierContactWrite(data, logoFile, removeLogo);
    await onSubmit(submission.data, { file: submission.file, removeLogo: submission.removeLogo });
    setLogoFile(null);
    setRemoveLogo(false);
    form.reset({
      name: "",
      role: "",
      whatsapp: "",
      email: "",
      type: ContactType.TEAM_MEMBER,
      category: undefined,
      instagramUrl: "",
      facebookUrl: "",
      tiktokUrl: "",
      url: "",
      description: "",
    });
  };

  return (
    <FormLayout
      title={contact ? "Editar Contato" : "Novo Contato"}
      onSubmit={handleSubmit}
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
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                if (value !== ContactType.SUPPLIER) {
                  form.setValue("category", undefined);
                }
              }}
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
      {contactType === ContactType.SUPPLIER && (
        <>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PARTNER_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {PARTNER_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do serviço</FormLabel>
              <FormControl>
                <Textarea placeholder="O que o parceiro oferece" maxLength={400} rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="contact-logo">Logo</label>
          {contact?.logoUrl && !removeLogo && !logoFile ? (
            <img src={contact.logoUrl} alt="" className="h-[72px] w-[72px] rounded-full object-cover" />
          ) : null}
          <input
            id="contact-logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              if (next && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(next.type)) {
                toast({ title: "Logo", description: "A logo precisa ser uma imagem", variant: "destructive" });
                event.target.value = "";
                return;
              }
              setLogoFile(next);
              if (next) setRemoveLogo(false);
            }}
          />
          {contact?.logoUrl && !logoFile ? (
            <button
              type="button"
              className="text-sm text-red-600"
              onClick={() => {
                setRemoveLogo((current) => !current);
                setLogoFile(null);
              }}
            >
              {removeLogo ? "Manter logo" : "Remover logo"}
            </button>
          ) : null}
        </div>
        </>
      )}
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
      {form.watch("type") === ContactType.SUPPLIER && (
        <>
          <FormField
            control={form.control}
            name="instagramUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="URL do Instagram" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="facebookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="URL do Facebook" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tiktokUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TikTok (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="URL do TikTok" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="URL do site" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormLayout>
  );
} 