import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit,
  Users,
  Search,
  LayoutGrid,
  List,
  Pencil,
} from "lucide-react";
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
  const { goals, fetchGoals, isLoading: isLoadingGoals } = useGoalStore();
  const { user } = useUserStore();
  const { surcharges, discounts, fetchSurcharges, fetchDiscounts, isLoading: isLoadingSeasonalFees } = useSeasonalFeeStore();
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
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
  const { selectedVenue: venue, fetchVenueById, isLoading, updateVenuePaymentInfo } = useVenueStore();

  const pricingType = () => {
    if (venue?.pricingModel === "PER_DAY") {
      return {
        type: "Preço por Diária",
        price: venue?.pricePerDay,
      };
    } else if (venue?.pricingModel === "PER_PERSON") {
      return {
        type: "Preço por Pessoa",
        price: venue?.pricePerPerson,
      };
    } else if (venue?.pricingModel === "PER_PERSON_HOUR") {
      return {
        type: "Preço por Pessoa por Hora",
        price: venue?.pricePerPersonHour,
      };
    } else if (venue?.pricingModel === "PER_PERSON_DAY") {
      return {
        type: "Preço por Pessoa por Dia",
        price: venue?.pricePerPersonDay,
      };
    };
  };

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
    }
  }, [venueId]);

  const handleCardClick = (tabId: string) => {
    setActiveTab(tabId);
    setViewMode("card");
  };

  const { currentUserVenuePermission } = useUserVenuePermissionStore();
   
  const hasViewPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("VIEW_VENUE_PRICES");
  };

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_VENUE_PRICES");
  };

  if(!hasViewPermission()) {
    return <DashboardLayout title="Contatos" subtitle="Gerencie os contatos do espaço">
     <AccessDenied />
    </DashboardLayout>
  }


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
          }}
          isFormOpen={showGoalForm || feeDialogOpen || discountDialogOpen}
        />

        {/* Panel View */}
        {viewMode === "panel" && (
          <div className="space-y-6">
            {/* Pricing Model Section */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Modelo de Precificação</CardTitle>
                <CardDescription>
                  O modelo de preço atual para o espaço.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full md:w-1/3">
                  {!isEditingPricing ? (
                    <div className="p-6 border rounded-lg bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{pricingType()?.type}</h3>
                            <p className="text-2xl font-bold text-primary mt-1">
                              {pricingType()?.price?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditingPricing(true)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Goals Section */}
            <section className="bg-white p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">Metas</h2>
                        <Button
                          className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => handleCardClick("metas")}
                        >
                  Ver todas
                        </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoadingGoals ? (
                  <div className="col-span-3 text-center text-gray-500">Carregando metas...</div>
                ) : goals.length === 0 ? (
                  <EmptyState
                    hasEditPermission={hasEditPermission()}
                    title="Nenhuma meta cadastrada"
                    description="Cadastre uma meta para começar a acompanhar o desempenho do seu espaço"
                    actionText="Nova Meta"
                    onAction={() => setShowGoalForm(true)}
                  />
                ) : (
                  goals.slice(0, 3).map((goal) => {
                    const monthNumbers = goal.months
                      .split(',')
                      .map(m => Number(m.trim()))
                      .filter(n => !isNaN(n) && n >= 1 && n <= 12)
                      .sort((a, b) => a - b);
                    const monthNames = monthNumbers.map(n => monthLabels[n - 1]);
                    return (
                      <Card 
                        key={goal.id} 
                        className="bg-white border shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleCardClick("metas")}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">
                                Meta: {goal.minValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                {goal.maxValue ? ` - ${goal.maxValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Meses: {monthNames.join(', ')}
                              </p>
                            </div>
                            <div className="bg-gray-100 p-1 rounded">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-xs text-gray-600 mb-1">Taxa de aumento</div>
                            <div className={`font-medium ${goal.increasePercent === 10 ? 'text-green-600' : ''}`}>{goal.increasePercent}%</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </section>

            {/* Adicionais Section */}
            <section className="bg-white p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">Adicionais</h2>
                        <Button
                          className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => handleCardClick("adicionais")}
                        >
                  Ver todos
                        </Button>
              </div>

              <div className="space-y-4">
                {isLoadingSeasonalFees ? (
                  <div className="text-center text-gray-500">Carregando adicionais...</div>
                ) : surcharges.length === 0 ? (
                    <EmptyState
                      hasEditPermission={hasEditPermission()}
                      title="Nenhum adicional cadastrado"
                      description="Cadastre um adicional para começar a definir taxas extras para seu espaço"
                      actionText="Novo Adicional"
                      onAction={() => setFeeDialogOpen(true)}
                    />
                  ) : (
                  surcharges.slice(0, 3).map((fee) => (
                    <Card 
                      key={fee.id} 
                      className="bg-white border hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                      onClick={() => handleCardClick("adicionais")}
                    >
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-lg text-gray-800">{fee.title}</h3>
                              {fee.startDay && fee.endDay && (
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>{fee.startDay} até {fee.endDay}</span>
                                </div>
                              )}
                              {fee.affectedDays && (
                              <div className="text-sm text-gray-600 mt-1 max-w-[50%]">{traduzirDiasSemana(fee.affectedDays)}</div>
                              )}
                            </div>
                            <div className="text-lg font-bold text-green-500">+ {fee.fee} %</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </section>

            {/* Descontos Section */}
            <section className="bg-white p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">Descontos</h2>
                        <Button
                          className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => handleCardClick("descontos")}
                        >
                  Ver todos
                        </Button>
              </div>

              <div className="space-y-4">
                {isLoadingSeasonalFees ? (
                  <div className="text-center text-gray-500">Carregando descontos...</div>
                ) : discounts.length === 0 ? (
                    <EmptyState
                      hasEditPermission={hasEditPermission()}
                      title="Nenhum desconto cadastrado"
                      description="Cadastre um desconto para começar a definir reduções de preço para seu espaço"
                      actionText="Novo Desconto"
                      onAction={() => setDiscountDialogOpen(true)}
                    />
                  ) : (
                  discounts.slice(0, 3).map((discount) => (
                    <Card 
                      key={discount.id} 
                      className="bg-white border hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                      onClick={() => handleCardClick("descontos")}
                    >
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-lg text-gray-800">{discount.title}</h3>
                              {discount.startDay && discount.endDay && (
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>{discount.startDay} até {discount.endDay}</span>
                                </div>
                              )}
                              {discount.affectedDays && (
                              <div className="text-sm text-gray-600 mt-1 max-w-[50%]">{traduzirDiasSemana(discount.affectedDays)}</div>
                              )}
                            </div>
                          <div className="text-lg font-bold text-red-500">{`-${discount.fee}%`}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </section>
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
