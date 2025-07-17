import { useState, useEffect } from "react";
import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormLayout } from "@/components/ui/form-layout";
import { EmptyState } from "@/components/ui/empty-state";
import { VenueImageItem } from "./VenueImageItem";
import { ItemListVenueResponse } from "@/types/venue";
import { Image } from "@/types/image";
import { toast } from "@/components/ui/use-toast";
import { useOrganizationStore } from "@/store/organizationStore";
import { useUserOrganizationStore } from "@/store/userOrganizationStore";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
// Validação: pelo menos um campo true
const schema = z
  .record(z.boolean())
  .refine((data) => Object.values(data).some(Boolean), {
    message: "Selecione pelo menos uma imagem",
  });

type FormData = z.infer<typeof schema>;

export function SelectVenueImagesForm({
  images = [],
  venueId,
  onCancel,
  setShowForm,
  setSelectVenue,
  organizationId,
  loading = false,
}: {
  images?: Image[];
  venueId: string;
  organizationId: string;   
  onCancel: () => void;
  setShowForm: (show: boolean) => void;
  setSelectVenue: (venue: ItemListVenueResponse | null) => void;
  loading?: boolean;
}) {
 
  const [imageIds, setImageIds] = useState<string[]>([]);
  const { updateVenueOrganizationImages } = useOrganizationStore();
  const { fetchVenues } = useVenueStore();
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUserStore();
 
  // Garante que images sempre seja um array
  const safeImages = Array.isArray(images) ? images : [];
  // Inicializa o form com os ids das imagens marcadas como showOnOrganization
  const defaultValues = Object.fromEntries(
    safeImages.map((img) => [img.id, !!img.isShowOnOrganization])
  );
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    const defaultValues = Object.fromEntries(
      safeImages.map((img) => [img.id, !!img.isShowOnOrganization])
    );
    form.reset(defaultValues);
    // eslint-disable-next-line
  }, [JSON.stringify(safeImages)]);

  if (!safeImages.length) {
    return (
      <EmptyState
        title="Nenhuma imagem encontrada"
        description="Adicione imagens à venue para poder selecionar quais aparecem no site."
        action={undefined}
      />
    );
  }

  if (loading) {
    // Renderiza skeletons de carregamento
    return (
      <FormLayout
        title="Selecionar imagens"
        onSubmit={() => {}}
        onCancel={onCancel}
        submitLabel="Salvar"
        form={form}
        customSubmitButton={null}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 mb-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="relative w-full h-64 flex flex-col animate-pulse"
            >
              <div className="w-full h-64 bg-gray-300 rounded border" />
              <div className="absolute top-2 right-2 w-5 h-5 rounded bg-gray-200 border-2 border-gray-300 z-10" />
            </div>
          ))}
        </div>
      </FormLayout>
    );
  }

  async function handleSaveVenueImages(imageIds: string[]) {
    if (!organizationId || imageIds.length === 0) return;
    setIsSaving(true);
    try {
      const response = await updateVenueOrganizationImages({
        organizationId: organizationId,
        venueId: venueId,
        imageids: imageIds,
      });
      const { title, message } = handleBackendSuccess(
        response,
        "Imagens atualizadas com sucesso!"
      );
      toast({
        title,
        description: message,
      });
      fetchVenues({ organizationId: organizationId, userId: user.id });
      setShowForm(false);
      setSelectVenue(null);
    } catch (error) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao atualizar imagens. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const onSubmit = (data: FormData) => {
    const selecionadas = Object.entries(data)
      .filter(([_, v]) => v)
      .map(([id]) => id);
    handleSaveVenueImages(selecionadas);
  };

  return (
    <FormLayout
      title="Selecionar imagens"
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="Salvar"
      form={form}
      customSubmitButton={null}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 mb-8">
        {safeImages.map((img) => (
          <div key={img.id} className="relative w-full h-64 flex flex-col">
            <img
              src={img.imageUrl}
              alt={`Imagem ${img.id}`}
              className="w-full h-64 object-cover rounded border"
            />
            <input
              type="checkbox"
              {...form.register(img.id)}
              className="absolute top-2 right-2 w-5 h-5 rounded bg-white shadow-md border-2 border-gray-300 focus:ring-2 focus:ring-green-600 z-10 cursor-pointer"
              style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
              aria-label={`Selecionar imagem ${img.id}`}
            />
          </div>
        ))}
      </div>
      {form.formState.errors && form.formState.errors.root && (
        <span className="text-red-500 text-sm block mb-2">
          {(form.formState.errors.root as FieldError)?.message}
        </span>
      )}
    </FormLayout>
  );
}
