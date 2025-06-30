import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLayout } from "@/components/ui/form-layout";
import { useOrganizationStore } from "@/store/organizationStore";
import { useToast } from "@/components/ui/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  whatsappNumber: z.string().optional(),
  tiktokUrl: z.string().url("URL do TikTok inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL do Instagram inválida").optional().or(z.literal("")),
  facebookUrl: z.string().url("URL do Facebook inválida").optional().or(z.literal("")),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  logoFile: z.instanceof(File).optional(),
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

interface OrganizationCreateFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function OrganizationCreateForm({ userId, onSuccess, onCancel }: OrganizationCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { createOrganization } = useOrganizationStore();
  const { toast } = useToast();

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsappNumber: "",
      tiktokUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      url: "",
      logoFile: undefined,
    },
  });

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      onChange(file);
    } else {
      setLogoPreview(null);
      onChange(null);
    }
  };

  const handleSubmit = async (values: CreateOrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await createOrganization({
        name: values.name,
        userId,
        email: values.email,
        whatsappNumber: values.whatsappNumber || undefined,
        tiktokUrl: values.tiktokUrl || undefined,
        instagramUrl: values.instagramUrl || undefined,
        facebookUrl: values.facebookUrl || undefined,
        url: values.url || undefined,
        logoFile: values.logoFile,
      });
      const { title, message } = handleBackendSuccess(response, "Organização criada com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      form.reset();
      if (onSuccess) onSuccess();
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao criar organização. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title="Nova Organização"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Criar"
    >
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome da organização"
                      required
                      className="mt-1"
                      {...field}
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
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@organizacao.com"
                      required
                      className="mt-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="whatsappNumber"
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
        </div>

        {/* Redes Sociais */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Instagram</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://instagram.com/sua-organizacao"
                      {...field}
                    />
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
                  <FormLabel>URL do Facebook</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://facebook.com/sua-organizacao"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tiktokUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do TikTok</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://tiktok.com/@sua-organizacao"
                      {...field}
                    />
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
                  <FormLabel>URL da Organização</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://sua-organizacao.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-4">

          <FormField
            control={form.control}
            name="logoFile"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Logo da Organização</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e, onChange)}
                    {...field}
                  />
                </FormControl>
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo da organização"
                      className="max-h-40 rounded border shadow"
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(logoPreview, "_blank")}
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormLayout>
  );
} 