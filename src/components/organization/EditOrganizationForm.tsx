import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormLayout } from "@/components/ui/form-layout";
import { useOrganizationStore } from "@/store/organizationStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Organization, UpdateOrganizationDTO } from "@/types/organization";
import { useNavigate } from "react-router-dom";

const editOrganizationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  whatsappNumber: z.string().optional(),
  tiktokUrl: z.string().url("URL do TikTok inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL do Instagram inválida").optional().or(z.literal("")),
  facebookUrl: z.string().url("URL do Facebook inválida").optional().or(z.literal("")),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  logoFile: z.instanceof(File).optional(),
  logoUrl: z.string().optional(),
});

type EditOrganizationFormValues = z.infer<typeof editOrganizationSchema>;

interface EditOrganizationFormProps {
  organization: Organization;
  onCancel: () => void;
  onSuccess?: () => void;
  organizationId: string;
}

export function EditOrganizationForm({
  organization,
  onCancel,
  organizationId,
  onSuccess,
}: EditOrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { updateOrganizationById, deleteOrganization } = useOrganizationStore();
  const { toast } = useToast();

  const form = useForm<EditOrganizationFormValues>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues: {
      name: organization.name || "",
      email: organization.email || "",
      whatsappNumber: organization.whatsappNumber || "",
      tiktokUrl: organization.tiktokUrl || "",
      instagramUrl: organization.instagramUrl || "",
      facebookUrl: organization.facebookUrl || "",
      url: organization.url || "",
      logoFile: undefined,
      logoUrl: organization.logoUrl || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: organization.name || "",
      email: organization.email || "",
      whatsappNumber: organization.whatsappNumber || "",
      tiktokUrl: organization.tiktokUrl || "",
      instagramUrl: organization.instagramUrl || "",
      facebookUrl: organization.facebookUrl || "",
      url: organization.url || "",
      logoFile: undefined,
    });
  }, [organization, form]);

  const handleSubmit = async (values: EditOrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      // Monta o payload e só inclui logoFile se for um File válido
      const payload: UpdateOrganizationDTO = {
        organizationId: organization.id,
        name: values.name,
        email: values.email,
        whatsappNumber: values.whatsappNumber || undefined,
        tiktokUrl: values.tiktokUrl || undefined,
        instagramUrl: values.instagramUrl || undefined,
        facebookUrl: values.facebookUrl || undefined,
        url: values.url || undefined,
      };
      if (values.logoFile instanceof File) {
        payload.logoFile = values.logoFile;
      }

      const response = await updateOrganizationById(payload);
      const { title, message } = handleBackendSuccess(response, "Organização atualizada com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      if (onSuccess) onSuccess();
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar organização. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const navigate = useNavigate();
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteOrganization(organization.id);
      const { title, message } = handleBackendSuccess(response, "Organização excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      if (onSuccess) onSuccess();
      navigate ("/dashboard");
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir organização. Tente novamente mais tarde.");
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
      form={form}
      title="Editar Organização"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={true}
      onDelete={handleDelete}
      entityName={organization.name}
      entityType="organização"
      isDeleting={isDeleting}
      submitLabel="Salvar"
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
            render={() => (
              <FormItem>
                <FormLabel>Logo da Organização</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        setLogoPreview(URL.createObjectURL(file));
                        form.setValue("logoFile", file);
                      } else {
                        setLogoPreview(null);
                        form.setValue("logoFile", undefined);
                      }
                    }}
                  />
                </FormControl>
                {/* Preview da nova logo selecionada */}
                {logoPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Nova logo selecionada:</p>
                    <img
                      src={logoPreview}
                      alt="Nova logo da organização"
                      className="max-h-40 rounded border shadow"
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(logoPreview, "_blank")}
                    />
                  </div>
                )}
                {/* Preview da logo atual se existir e não houver nova logo selecionada */}
                {organization.logoUrl && !logoPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Logo atual:</p>
                    <img
                      src={organization.logoUrl}
                      alt="Logo atual da organização"
                      className="max-h-40 rounded border shadow"
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(organization.logoUrl, "_blank")}
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