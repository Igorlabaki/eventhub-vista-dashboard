import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GoalsPanelSummary } from "@/components/goal/GoalsPanelSummary";
import { GoalsPanelSections } from "@/components/goal/GoalsPanelSections";
import { resolveCurrentPrice } from "@/components/goal/goals-panel-metrics";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVenueStore } from "@/store/venueStore";
import { useGoalStore } from "@/store/goalStore";
import { useParams } from "react-router-dom";
import { useSeasonalFeeStore } from "@/store/seasonalFeeStore";
import { GoalHeader } from "@/components/goal/goal-header";
import { GoalsTab } from "@/components/goal/GoalsTab";
import { FeesTab } from "@/components/goal/FeesTab";
import { DiscountsTab } from "@/components/goal/DiscountsTab";
import { MinimumPricesTab } from "@/components/goal/MinimumPricesTab";
import { useMinimumPricePeriodStore } from "@/store/minimumPricePeriodStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericFormat } from 'react-number-format';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateVenueDTO } from "@/types/venue";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useUserStore } from "@/store/userStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { Permissions } from "@/types/permissions";
import AccessDenied from "@/components/accessDenied";
type SeasonalFeeType = "SEASONAL" | "WEEKDAY" | "SURCHARGE" | "DISCOUNT";
type ViewModeType = "card" | "panel";
interface SeasonalFee {
  id: string;
  type: SeasonalFeeType;
  title: string;
  startDay?: string;
  endDay?: string;
  fee: number;
  venueId: string;
  affectedDays?: string;
}
interface Goal {
  id: string;
  minValue: number;
  maxValue?: number;
  increasePercent: number;
  months: string;
  venueId: string;
  createdAt: string;
  updatedAt: string;
}
// Função utilitária para traduzir dias da semana de inglês para português
const diasSemanaEnPt: Record<string, string> = {
  'monday': 'segunda-feira',
  'tuesday': 'terça-feira',
  'wednesday': 'quarta-feira',
  'thursday': 'quinta-feira',
  'friday': 'sexta-feira',
  'saturday': 'sábado',
  'sunday': 'domingo',
};
function traduzirDiasSemana(str: string) {
  return str
    .split(',')
    .map(dia => {
      const d = dia.trim().toLowerCase();
      return diasSemanaEnPt[d] || dia.trim();
    })
    .join(', ');
}

const pricingModels = [
  { value: "PER_PERSON", label: "Por pessoa" },
  { value: "PER_DAY", label: "Por dia" },
  { value: "PER_PERSON_DAY", label: "Por pessoa/dia" },
  { value: "PER_PERSON_HOUR", label: "Por pessoa/hora" },
] as const;

type PricingModel = "PER_PERSON" | "PER_DAY" | "PER_PERSON_DAY" | "PER_PERSON_HOUR";

const pricingFormSchema = z.object({
  pricingModel: z.enum(["PER_PERSON", "PER_DAY", "PER_PERSON_DAY", "PER_PERSON_HOUR"] as const),
  price: z.string().min(1, "O preço é obrigatório"),
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

interface PricingUpdateData extends Partial<CreateVenueDTO> {
  pricingModel: PricingModel;
  pricePerDay?: string;
  pricePerPerson?: string;
  pricePerPersonDay?: string;
  pricePerPersonHour?: string;
}

export default function VenueGoals() {
  // Define viewMode with the correct type
  const [viewMode, setViewMode] = useState<ViewModeType>("panel");
  const [activeTab, setActiveTab] = useState("metas");

  // Auto-select the panel view on first load
  useEffect(() => {
    setViewMode("panel");
  }, []);
  const { id: venueId } = useParams<{ id: string }>();
  const { goals, fetchGoals, isLoading: isLoadingGoals, error: goalsError } = useGoalStore();
  const { user } = useUserStore();
  const { surcharges, discounts, fetchSurcharges, fetchDiscounts, isLoading: isLoadingSeasonalFees, error: feesError } = useSeasonalFeeStore();
  const { periods, fetchPeriods, isLoading: isLoadingPeriods, error: periodsError } = useMinimumPricePeriodStore();
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [minimumDialogOpen, setMinimumDialogOpen] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const handleTabChange = (value: string) => {
    if (value === "panel") {
      setViewMode("panel");
      setActiveTab("panel");
    } else {
      setActiveTab(value);
      setViewMode("card");
    }
  };
  const { selectedVenue: venue, fetchVenueById, isLoading, error: venueError, updateVenuePaymentInfo } = useVenueStore();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value.replace(/\D/g, '');
    const number = parseInt(value) / 100;
    onChange(number.toString());
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "R$ 0,00";
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const pricingForm = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      pricingModel: (venue?.pricingModel || "PER_DAY") as PricingModel,
      price: (() => {
        switch (venue?.pricingModel) {
          case "PER_DAY":
            return venue?.pricePerDay?.toString() || "0";
          case "PER_PERSON":
            return venue?.pricePerPerson?.toString() || "0";
          case "PER_PERSON_DAY":
            return venue?.pricePerPersonDay?.toString() || "0";
          case "PER_PERSON_HOUR":
            return venue?.pricePerPersonHour?.toString() || "0";
          default:
            return "0";
        }
      })(),
    },
  });

  // Atualiza o preço quando o modelo de precificação mudar
  useEffect(() => {
    const subscription = pricingForm.watch((value, { name }) => {
      if (name === "pricingModel" && venue) {
        const newPrice = (() => {
          switch (value.pricingModel) {
            case "PER_DAY":
              return venue.pricePerDay?.toString() || "0";
            case "PER_PERSON":
              return venue.pricePerPerson?.toString() || "0";
            case "PER_PERSON_DAY":
              return venue.pricePerPersonDay?.toString() || "0";
            case "PER_PERSON_HOUR":
              return venue.pricePerPersonHour?.toString() || "0";
            default:
              return "0";
          }
        })();
        pricingForm.setValue("price", newPrice);
      }
    });
    return () => subscription.unsubscribe();
  }, [pricingForm, venue]);

  const handlePricingSubmit = async (values: PricingFormValues) => {
    setIsSubmitting(true);
    try {
      const updateData: PricingUpdateData = {
        pricingModel: values.pricingModel as PricingModel,
      };

      switch (values.pricingModel) {
        case "PER_DAY":
          updateData.pricePerDay = values.price;
          break;
        case "PER_PERSON":
          updateData.pricePerPerson = values.price;
          break;
        case "PER_PERSON_DAY":
          updateData.pricePerPersonDay = values.price;
          break;
        case "PER_PERSON_HOUR":
          updateData.pricePerPersonHour = values.price;
          break;
      }

      const response = await updateVenuePaymentInfo({
        venueId: venueId!,
        userId: user?.id,
        pricingModel: values.pricingModel as PricingModel,
        pricePerDay: values.price && values.price !== "0" ? values.price : undefined,
        pricePerPerson: values.price && values.price !== "0" ? values.price : undefined,
        pricePerPersonDay: values.price && values.price !== "0" ? values.price : undefined,
        pricePerPersonHour: values.price && values.price !== "0" ? values.price : undefined,
      });
      const { title, message } = handleBackendSuccess(response, "Preço atualizado com sucesso!");
      showSuccessToast({ title, description: message });
      setIsEditingPricing(false);
      
      // Atualiza o venue no store
      if (user?.id) {
        await fetchVenueById(venueId!, user.id);
      }
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar preço. Tente novamente mais tarde.");
      toast({ title, description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (venueId) {
      fetchGoals(venueId);
      fetchSurcharges(venueId);
      fetchDiscounts(venueId);
      fetchPeriods(venueId);
    }
  }, [venueId]);

  const handleCardClick = (tabId: string) => {
    setActiveTab(tabId);
    setViewMode("card");
  };

  const { currentUserVenuePermission } = useUserVenuePermissionStore();
   
  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_VENUE_PRICES");
  };

  return (
    <DashboardLayout
      title="Metas e Preços"
      subtitle="Gerencie as metas e preços do espaço"
    >
      <div className="space-y-8">
        <GoalHeader
          activeTab={viewMode === "panel" ? "panel" : activeTab}
          onTabChange={handleTabChange}
          onActionClick={() => {
            if (activeTab === "metas") {
              setSelectedGoal(null);
              setShowGoalForm(true);
            }
            if (activeTab === "adicionais") setFeeDialogOpen(true);
            if (activeTab === "descontos") setDiscountDialogOpen(true);
            if (activeTab === "minimos") {
              setMinimumDialogOpen(true);
            }
          }}
          isFormOpen={showGoalForm || feeDialogOpen || discountDialogOpen || minimumDialogOpen}
        />

        {/* Panel View */}
        {viewMode === "panel" && (
          <div className="space-y-6">
            <GoalsPanelSummary
              venueLoading={isLoading}
              venueError={venueError}
              venue={venue ?? null}
              goalsLoading={isLoadingGoals}
              goalsError={goalsError}
              goals={goals}
              feesLoading={isLoadingSeasonalFees}
              feesError={feesError}
              surchargeCount={surcharges.length}
              discountCount={discounts.length}
            />
            <GoalsPanelSections
              canEdit={hasEditPermission()}
              price={resolveCurrentPrice(venue)}
              priceLoading={isLoading}
              priceError={venueError}
              isEditingPrice={isEditingPricing}
              onEditPrice={() => setIsEditingPricing(true)}
              priceEditor={
                <Form {...pricingForm}>
                  <form onSubmit={pricingForm.handleSubmit(handlePricingSubmit)} className="space-y-4">
                    <FormField
                      control={pricingForm.control}
                      name="pricingModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo de Precificação</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o modelo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pricingModels.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={pricingForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço</FormLabel>
                          <FormControl>
                            <Input
                              value={formatCurrency(field.value)}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              placeholder="R$ 0,00"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingPricing(false)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              }
              goals={goals}
              goalsLoading={isLoadingGoals}
              goalsError={goalsError}
              surcharges={surcharges}
              discounts={discounts}
              feesLoading={isLoadingSeasonalFees}
              feesError={feesError}
              minimumPrice={venue?.minimumPrice}
              venueLoading={isLoading}
              venueError={venueError}
              periods={periods}
              periodsLoading={isLoadingPeriods}
              periodsError={periodsError}
              monthLabels={monthLabels}
              translateDays={traduzirDiasSemana}
              onOpen={handleCardClick}
              onCreateGoal={() => {
                setSelectedGoal(null);
                setShowGoalForm(true);
                handleCardClick("metas");
              }}
              onCreateSurcharge={() => {
                setFeeDialogOpen(true);
                handleCardClick("adicionais");
              }}
              onCreateDiscount={() => {
                setDiscountDialogOpen(true);
                handleCardClick("descontos");
              }}
              onCreatePeriod={() => {
                setMinimumDialogOpen(true);
                handleCardClick("minimos");
              }}
            />
          </div>
        )}

        {/* Card View with Tabs */}
        {viewMode === "card" && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* METAS TAB */}
            <TabsContent value="metas" className="space-y-4">
              <GoalsTab
                goals={goals}
                isLoading={isLoadingGoals}
                monthLabels={monthLabels}
                showForm={showGoalForm}
                setShowForm={setShowGoalForm}
                selectedGoal={selectedGoal}
                setSelectedGoal={setSelectedGoal}
              />
            </TabsContent>
            {/* ADICIONAIS TAB */}
            <TabsContent value="adicionais" className="space-y-4">
              <FeesTab
                fees={surcharges}
                isLoading={isLoadingSeasonalFees}
                traduzirDiasSemana={traduzirDiasSemana}
                venueId={venueId || ""}
                showForm={feeDialogOpen}
                setShowForm={setFeeDialogOpen}
              />
            </TabsContent>
            <TabsContent value="minimos" className="space-y-4">
              <MinimumPricesTab
                periods={periods}
                isLoading={isLoadingPeriods}
                error={periodsError}
                venue={venue}
                userId={user?.id}
                canEdit={hasEditPermission()}
                showForm={minimumDialogOpen}
                setShowForm={setMinimumDialogOpen}
                onReload={() => venueId && fetchPeriods(venueId)}
              />
            </TabsContent>
            {/* DESCONTOS TAB */}
            <TabsContent value="descontos" className="space-y-4">
              <DiscountsTab
                traduzirDiasSemana={traduzirDiasSemana}
                discounts={discounts}
                isLoading={isLoadingSeasonalFees}
                showForm={discountDialogOpen}
                setShowForm={setDiscountDialogOpen}
              />
            </TabsContent>
          </Tabs>
        )}

      </div>
    </DashboardLayout>
  );
}
