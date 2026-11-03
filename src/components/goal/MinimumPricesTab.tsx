import { useState } from "react";
import { Calendar, Pencil } from "lucide-react";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { MinimumPricePeriod } from "@/types/minimumPricePeriod";
import { UpdateVenueDTO, Venue } from "@/types/venue";
import { useMinimumPricePeriodStore } from "@/store/minimumPricePeriodStore";
import { useVenueStore } from "@/store/venueStore";
import { MinimumPriceForm } from "./minimum-price-form";

function formatMoney(value?: number | null) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function currencyToApi(value: string) {
  const sanitized = value.replace(/R\$|\s|\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
  return sanitized;
}

function formatCurrencyInput(value: string) {
  const number = Number(value.replace(/\D/g, "")) / 100;
  return number ? `R$ ${number.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "";
}

function venuePayload(venue: Venue, userId: string, minimumPrice: string): UpdateVenueDTO {
  return {
    userId,
    venueId: venue.id,
    name: venue.name,
    email: venue.email || undefined,
    cep: venue.cep,
    city: venue.city,
    state: venue.state,
    street: venue.street,
    streetNumber: venue.streetNumber,
    neighborhood: venue.neighborhood,
    complement: venue.complement || undefined,
    description: venue.description,
    url: venue.url || undefined,
    checkIn: venue.checkIn || undefined,
    checkOut: venue.checkOut || undefined,
    openingHour: venue.openingHour,
    closingHour: venue.closingHour,
    logoUrl: venue.logoUrl || undefined,
    maxGuest: String(venue.maxGuest),
    tiktokUrl: venue.tiktokUrl || undefined,
    facebookUrl: venue.facebookUrl || undefined,
    instagramUrl: venue.instagramUrl || undefined,
    whatsappNumber: venue.whatsappNumber || undefined,
    minimumNights: venue.minimumNights != null ? String(venue.minimumNights) : undefined,
    hasOvernightStay: venue.hasOvernightStay,
    pricingModel: venue.pricingModel as UpdateVenueDTO["pricingModel"],
    standardEventDuration: String(venue.standardEventDuration ?? 0),
    pricePerDay: venue.pricePerDay != null ? String(venue.pricePerDay) : undefined,
    pricePerPerson: venue.pricePerPerson != null ? String(venue.pricePerPerson) : undefined,
    pricePerPersonDay: venue.pricePerPersonDay != null ? String(venue.pricePerPersonDay) : undefined,
    pricePerPersonHour: venue.pricePerPersonHour != null ? String(venue.pricePerPersonHour) : undefined,
    minimumPrice,
  };
}

interface MinimumPricesTabProps {
  periods: MinimumPricePeriod[];
  isLoading: boolean;
  error: string | null;
  venue: Venue | null;
  userId?: string;
  canEdit: boolean;
  showForm: boolean;
  setShowForm: (open: boolean) => void;
  onReload: () => void;
}

export function MinimumPricesTab({
  periods,
  isLoading,
  error,
  venue,
  userId,
  canEdit,
  showForm,
  setShowForm,
  onReload,
}: MinimumPricesTabProps) {
  const [selected, setSelected] = useState<MinimumPricePeriod | null>(null);
  const [toDelete, setToDelete] = useState<MinimumPricePeriod | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingDefault, setEditingDefault] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");
  const [savingDefault, setSavingDefault] = useState(false);
  const { deletePeriod } = useMinimumPricePeriodStore();
  const { updateVenue, fetchVenueById } = useVenueStore();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      const response = await deletePeriod(toDelete.id);
      const { title, message } = handleBackendSuccess(response, "Faixa excluída com sucesso!");
      showSuccessToast({ title, description: message });
      setToDelete(null);
      setSelected(null);
      setShowForm(false);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir a faixa.");
      toast({ title, description: message, variant: "destructive" });
    }
  };

  const saveDefault = async () => {
    if (!venue || !userId) return;
    const minimumPrice = currencyToApi(defaultValue);
    if (!minimumPrice) {
      toast({ title: "Valor inválido", description: "Informe o preço mínimo padrão.", variant: "destructive" });
      return;
    }
    setSavingDefault(true);
    try {
      const response = await updateVenue(venuePayload(venue, userId, minimumPrice));
      await fetchVenueById(venue.id);
      const { title, message } = handleBackendSuccess(response, "Preço mínimo padrão atualizado.");
      showSuccessToast({ title, description: message });
      setEditingDefault(false);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar o preço mínimo padrão.");
      toast({ title, description: message, variant: "destructive" });
    } finally {
      setSavingDefault(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Preço mínimo padrão</p>
            {editingDefault ? (
              <Input
                className="mt-2 max-w-xs"
                inputMode="decimal"
                value={defaultValue}
                onChange={(event) => setDefaultValue(formatCurrencyInput(event.target.value))}
              />
            ) : (
              <p className="text-2xl font-semibold text-violet-700">{formatMoney(venue?.minimumPrice)}</p>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {editingDefault ? (
                <>
                  <Button variant="outline" onClick={() => setEditingDefault(false)} disabled={savingDefault}>Cancelar</Button>
                  <Button onClick={saveDefault} disabled={savingDefault}>{savingDefault ? "Salvando..." : "Salvar"}</Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar preço mínimo padrão"
                  onClick={() => {
                    setDefaultValue(formatCurrencyInput(String(Math.round((venue?.minimumPrice || 0) * 100))));
                    setEditingDefault(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <Button variant="link" className="px-0" onClick={onReload}>Tentar de novo</Button>
        </div>
      )}

      <AnimatedFormSwitcher
        showForm={showForm}
        list={
          isLoading ? (
            <div className="text-center text-gray-500 py-8">Carregando faixas...</div>
          ) : periods.length === 0 ? (
            <EmptyState
              hasEditPermission={canEdit}
              title="Nenhuma faixa cadastrada"
              description="O ano inteiro usa o preço mínimo padrão até você criar um período."
              actionText="Nova faixa"
              onAction={() => {
                setSelected(null);
                setShowForm(true);
              }}
            />
          ) : (
            <div className="space-y-3">
              {periods.map((period) => (
                <Card key={period.id} className="bg-white border shadow-sm">
                  <CardContent className="pt-6 flex justify-between items-center gap-4">
                    <div>
                      <h3 className="font-medium text-lg">{period.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{period.startDay} até {period.endDay}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-green-600">{formatMoney(period.price)}</span>
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => { setSelected(period); setShowForm(true); }}>Editar</Button>
                          <Button variant="ghost" size="sm" onClick={() => { setToDelete(period); setConfirmOpen(true); }}>Excluir</Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        }
        form={
          <MinimumPriceForm
            period={selected}
            venueId={venue?.id || ""}
            onCancel={() => {
              setSelected(null);
              setShowForm(false);
            }}
            onDelete={() => {
              setToDelete(selected);
              setConfirmOpen(true);
            }}
          />
        }
      />
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        entityName={toDelete?.title || ""}
        entityType="faixa de preço mínimo"
      />
    </div>
  );
}
