import { Button } from "@/components/ui/button";
import { FormLayout } from "@/components/ui/form-layout";
import { useForm } from "react-hook-form";
import { ItemListVenueResponse, UpdateVenueInfoDTO } from "@/types/venue";
import { FC, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { useTextStore } from "@/store/textStore";
import { Text } from "@/types/text";
import { Plus, X, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

interface EditVenueFormProps {
  venue: ItemListVenueResponse;
  onCancel: () => void;
}

interface FormData {
  name: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  url?: string;
  description: string;
  state: string;
  city: string;
  isShowOnOrganization: boolean;
}

export const EditVenueForm: FC<EditVenueFormProps> = ({ venue, onCancel }) => {
  const { updateVenueInfo, isLoading } = useVenueStore();
  const { user } = useUserStore();
  const { toast } = useToast();
  const { createText, fetchTexts, texts, isLoading: isLoadingTexts, updateText, deleteText } = useTextStore();
  
  const [amenities, setAmenities] = useState<Text[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [editingAmenity, setEditingAmenity] = useState<Text | null>(null);
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: venue.name || "",
      tiktokUrl: venue.tiktokUrl || "",
      instagramUrl: venue.instagramUrl || "",
      facebookUrl: venue.facebookUrl || "",
      url: venue.url || "",
      description: venue.description || "",
      state: venue.state || "",
      city: venue.city || "",
      isShowOnOrganization: venue.isShowOnOrganization ?? true,
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: UpdateVenueInfoDTO = {
        userId: user.id,
        venueId: venue.id,
        name: values.name,
        tiktokUrl: values.tiktokUrl || undefined,
        instagramUrl: values.instagramUrl || undefined,
        facebookUrl: values.facebookUrl || undefined,
        url: values.url || undefined,
        description: values.description || undefined,
        state: values.state,
        city: values.city,
        isShowOnOrganization: values.isShowOnOrganization,
      };

      const response = await updateVenueInfo(updateData);
      const successResult = handleBackendSuccess(response, "Espaço atualizado com sucesso!");
      toast({
        title: successResult.title,
        description: successResult.message,
      });
      onCancel();
    } catch (error) {
      const errorResult = handleBackendError(error, "Erro ao atualizar espaço");
      toast({
        title: errorResult.title,
        description: errorResult.message,
        variant: "destructive",
      });
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 2);
    form.setValue("state", value);
  };

  // Buscar amenities existentes
  useEffect(() => {
    if (venue.id) {
      fetchTexts({ venueId: venue.id, area: `amenities` });
    }
  }, [venue.id, fetchTexts]);

  // Atualizar amenities quando texts mudar
  useEffect(() => {
    const venueAmenities = texts.filter(text => text.area === `amenities`);
    setAmenities(venueAmenities);
  }, [texts, venue.id]);

  const handleAddAmenity = async () => {
    if (!newAmenity.trim() || !user?.id) return;

    try {
      const position = amenities.length + 1; // Posição baseada no tamanho da lista + 2
      
      await createText({
        area: `amenities`,
        text: newAmenity.trim(),
        venueId: venue.id,
        position,
        title: `Amenity-${position}`
      });

      setNewAmenity("");
      setIsAddingAmenity(false);
      
      toast({
        title: "Sucesso",
        description: "Amenity adicionada com sucesso!",
      });
    } catch (error) {
      const errorResult = handleBackendError(error, "Erro ao adicionar amenity");
      toast({
        title: errorResult.title,
        description: errorResult.message,
        variant: "destructive",
      });
    }
  };

  const handleEditAmenity = async (amenity: Text, newText: string) => {
    if (!newText.trim()) return;

    try {
      const response = await updateText({
        textId: amenity.id,
        venueId: venue.id,
        data: {
          text: newText.trim()
        }
      });

      // Atualizar o estado local
      setAmenities(prev => prev.map(a => 
        a.id === amenity.id ? { ...a, text: newText.trim() } : a
      ));

      toast({
        title: "Sucesso",
        description: "Amenity atualizada com sucesso!",
      });
      setEditingAmenity(null);
    } catch (error) {
      const errorResult = handleBackendError(error, "Erro ao atualizar amenity");
      toast({
        title: errorResult.title,
        description: errorResult.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAmenity = async (amenityId: string) => {
    try {
      await deleteText(amenityId);

      // Atualizar o estado local
      setAmenities(prev => prev.filter(a => a.id !== amenityId));

      toast({
        title: "Sucesso",
        description: "Amenity removida com sucesso!",
      });
    } catch (error) {
      const errorResult = handleBackendError(error, "Erro ao remover amenity");
      toast({
        title: errorResult.title,
        description: errorResult.message,
        variant: "destructive",
      });
    }
  };

  return (
    <FormLayout
      title="Editar"
      onSubmit={onSubmit}
      onCancel={onCancel}
      form={form}
      isEditing
      submitLabel="Salvar alterações"
      isSubmitting={isLoading}
    >
      <div className="space-y-6">
        {/* Seção de informações básicas */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do espaço</Label>
            <Input
              id="name"
              {...form.register("name", { required: "Nome é obrigatório" })}
              placeholder="Digite o nome do espaço"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Digite a descrição do espaço"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                {...form.register("city", { required: "Cidade é obrigatória" })}
                placeholder="Digite a cidade"
              />
              {form.formState.errors.city && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                {...form.register("state", { 
                  required: "Estado é obrigatório",
                  maxLength: { value: 2, message: "Estado deve ter 2 letras" }
                })}
                placeholder="SP"
                maxLength={2}
                onChange={handleStateChange}
                style={{ textTransform: 'uppercase' }}
              />
              {form.formState.errors.state && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.state.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="url">Website</Label>
            <Input
              id="url"
              {...form.register("url")}
              placeholder="https://exemplo.com"
              type="url"
            />
          </div>

          <div>
            <Label htmlFor="tiktokUrl">TikTok</Label>
            <Input
              id="tiktokUrl"
              {...form.register("tiktokUrl")}
              placeholder="https://tiktok.com/@usuario"
              type="url"
            />
          </div>

          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              {...form.register("instagramUrl")}
              placeholder="https://instagram.com/usuario"
              type="url"
            />
          </div>

          <div>
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input
              id="facebookUrl"
              {...form.register("facebookUrl")}
              placeholder="https://facebook.com/pagina"
              type="url"
            />
          </div>

          {/* Campo de visibilidade na organização */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isShowOnOrganization"
              checked={form.watch("isShowOnOrganization")}
              onCheckedChange={(checked) => {
                form.setValue("isShowOnOrganization", checked as boolean);
              }}
            />
            <Label htmlFor="isShowOnOrganization" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Exibir este espaço no site da organização
            </Label>
          </div>
          <p className="text-sm text-gray-500">
            Quando desmarcado, o espaço ficará oculto do site público da organização
          </p>
        </div>

        {/* Seção de Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-center justify-between gap-y-2">
              <span>Características</span>
              <Button
                type="button"
                variant="outline"
                className={`${isAddingAmenity ? "hidden" : "bg-eventhub-primary hover:bg-indigo-600 text-white"}`}
                size="sm"
                onClick={() => setIsAddingAmenity(true)}
                disabled={isAddingAmenity}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar característica
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingTexts ? (
              <div className="flex justify-center py-4">
                <span className="sr-only">Carregando características...</span>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ) : (
              <>
                {/* Formulário para adicionar nova amenity */}
                {isAddingAmenity && (
                  <div className="flex flex-col sm:flex-row gap-2 p-3 border rounded-lg bg-gray-50">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Digite a amenity (ex: Piscina, Wi-Fi, Estacionamento)"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAmenity()}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddAmenity}
                      disabled={!newAmenity.trim()}
                    >
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingAmenity(false);
                        setNewAmenity("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Lista de amenities */}
                {amenities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma característica cadastrada ainda.
                    <br />
                    Clique em "Adicionar característica" para começar.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 border rounded-lg gap-2">
                        {editingAmenity?.id === amenity.id ? (
                          <div className="flex flex-col sm:flex-row gap-2 flex-1">
                            <Input
                              className="w-full sm:w-auto"
                              value={editingAmenity.text}
                              onChange={(e) => setEditingAmenity({ ...editingAmenity, text: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleEditAmenity(amenity, editingAmenity.text)}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleEditAmenity(amenity, editingAmenity.text)}
                            >
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAmenity(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">{amenity.text}</span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAmenity(amenity)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAmenity(amenity.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </FormLayout>
  );
}; 