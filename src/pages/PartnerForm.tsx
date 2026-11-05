import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { ProposalFooter } from "@/components/proposalFooter";
import { useContactStore } from "@/store/contactStore";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError } from "@/lib/error-handler";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ContactType } from "@/types/contact";
import { PARTNER_CATEGORIES, PARTNER_CATEGORY_LABELS } from "@/lib/partner-category";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "react-router-dom";
import { useVenueStore } from "@/store/venueStore";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { PartnerPublicCard } from "@/components/proposal/PartnerPublicCard";
import { Textarea } from "@/components/ui/textarea";

const partnerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.enum(PARTNER_CATEGORIES, { errorMap: () => ({ message: "Selecione a categoria" }) }),
  role: z.string().optional(),
  whatsapp: z.string().min(10, "WhatsApp é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  url: z.string().optional(),
  description: z.string().max(400, "A descrição passa de 400 caracteres").optional(),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function PartnerForm() {
  const { id } = useParams<{ id: string }>();
  const { selectedVenue, isLoading, fetchVenueById } = useVenueStore() || {};
  const { createContact } = useContactStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      category: undefined,
      role: "",
      whatsapp: "",
      email: "",
      instagramUrl: "",
      facebookUrl: "",
      tiktokUrl: "",
      url: "",
      description: "",
    },
  });

  React.useEffect(() => {
    const loadVenue = async () => {
      if (!id || !fetchVenueById) return;
      try {
        await fetchVenueById(id);
      } catch (error) {
        console.error("Erro ao buscar venue:", error);
      }
    };
    loadVenue();
  }, [id, fetchVenueById]);

  React.useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const preview = form.watch();

  if (!id) {
    console.error("ID do venue não encontrado");
    return <div>Erro: ID do venue não encontrado</div>;
  }

  if (isLoading || isLoading === undefined) {
    return <AppLoadingScreen />;
  }

  const onSubmit = async (data: PartnerFormValues) => {
    setIsSubmitting(true);
    setSuccess(false);
    try {
      await createContact({
        ...data,
        description: data.description?.trim() ?? "",
        type: ContactType.SUPPLIER,
        venueId: id,
      }, logoFile ?? undefined);
      setSuccess(true);
      setLogoFile(null);
      form.reset();
      showSuccessToast({
        title: "Cadastro realizado!",
        description: "Obrigado por se cadastrar como parceiro. Em breve entraremos em contato.",
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao cadastrar parceiro. Tente novamente mais tarde.");
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
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1 flex-col bg-eventhub-background py-14 px-2 md:px-8">
        <div className="flex items-center w-full justify-center mb-10">
          <Calendar className="h-8 w-8 text-eventhub-primary" />
          <span className="ml-2 font-bold text-3xl text-eventhub-primary">
            EventHub
          </span>
        </div>
        <div className="max-w-xl mx-auto w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-eventhub-primary">Cadastro de Parceiro</h2>
          <FormProvider {...form}>
            <form
              className="space-y-6"
              onSubmit={e => {
                e.preventDefault();
                form.handleSubmit(onSubmit)(e);
              }}
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
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do serviço</FormLabel>
                    <FormControl>
                      <Textarea placeholder="O que você oferece" maxLength={400} rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="partner-logo">Logo</label>
                <input
                  id="partner-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full text-sm"
                  onChange={(event) => {
                    const next = event.target.files?.[0] ?? null;
                    if (next && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(next.type)) {
                      toast({
                        title: "Logo",
                        description: "A logo precisa ser uma imagem",
                        variant: "destructive",
                      });
                      event.target.value = "";
                      return;
                    }
                    setLogoFile(next);
                  }}
                />
              </div>
              <div className="space-y-3">
                <p className="text-center text-sm font-medium text-eventhub-primary">Seu card</p>
                <PartnerPublicCard
                  variant="preview"
                  name={preview.name}
                  description={preview.description}
                  logoUrl={logoPreview}
                  whatsapp={preview.whatsapp}
                  email={preview.email}
                  instagramUrl={preview.instagramUrl}
                  facebookUrl={preview.facebookUrl}
                  tiktokUrl={preview.tiktokUrl}
                  url={preview.url}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-eventhub-primary text-white py-2 px-4 rounded hover:bg-eventhub-primary-dark transition disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </button>
              {success && (
                <div className="text-green-600 text-center font-medium mt-2">
                  Cadastro realizado com sucesso!
                </div>
              )}
            </form>
          </FormProvider>
        </div>
      </main>
      <ProposalFooter selectedVenue={selectedVenue} />
    </div>
  );
}
