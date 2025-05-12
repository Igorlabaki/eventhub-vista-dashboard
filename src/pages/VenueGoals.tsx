import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, TrendingUp, Calendar, DollarSign, Edit, Users, Search, LayoutGrid, List } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";

type SeasonalFeeType = "SEASONAL" | "WEEKDAY";

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
  createdAt: Date;
  updatedAt: Date;
}

export default function VenueGoals() {
  // Default to panel view
  const [viewMode, setViewMode] = useState<"card" | "panel">("panel");
  const [activeTab, setActiveTab] = useState("metas");
  
  // Auto-select the panel view on first load
  useEffect(() => {
    setViewMode("panel");
  }, []);
  
  const [goals, setGoals] = useState<any[]>([
    { 
      id: "1", 
      title: "Meta Mensal", 
      target: 50000, 
      current: 32500, 
      unit: "R$", 
      period: "Mai/2025",
      type: "revenue",
      percentage: 65
    },
    { 
      id: "2", 
      title: "Eventos no Mês", 
      target: 8, 
      current: 5, 
      unit: "eventos", 
      period: "Mai/2025",
      type: "events",
      percentage: 63
    },
    { 
      id: "3", 
      title: "Meta Anual", 
      target: 500000, 
      current: 180000, 
      unit: "R$", 
      period: "2025",
      type: "revenue",
      percentage: 36
    },
  ]);
  
  const [seasonalFees, setSeasonalFees] = useState<SeasonalFee[]>([
    {
      id: "1",
      type: "SEASONAL",
      title: "Fim de ano",
      startDay: "01/12",
      endDay: "31/12",
      fee: 30,
      venueId: "1"
    },
    {
      id: "2",
      type: "WEEKDAY",
      title: "Fim de Semana",
      affectedDays: "Sábado,Domingo",
      fee: 6,
      venueId: "1"
    }
  ]);

  const [discounts, setDiscounts] = useState<SeasonalFee[]>([
    {
      id: "3",
      type: "WEEKDAY",
      title: "Dias de Semana",
      affectedDays: "Segunda-feira,Terça-feira,Quarta-feira,Quinta-feira",
      fee: -15,
      venueId: "1"
    }
  ]);

  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  
  const [pricingModel, setPricingModel] = useState({
    model: "pricePerDay",
    pricePerDay: 15000,
    pricePerPerson: 250,
    pricePerPersonDay: null,
    pricePerPersonHour: null,
    extraHourPrice: 1500
  });

  // Calculate percentage for progress bars
  const getPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const feeForm = useForm({
    defaultValues: {
      type: "SEASONAL" as SeasonalFeeType,
      title: "",
      fee: 0,
      startDay: "",
      endDay: "",
      affectedDays: [] as string[]
    }
  });

  const discountForm = useForm({
    defaultValues: {
      type: "WEEKDAY" as SeasonalFeeType,
      title: "",
      fee: 0,
      startDay: "",
      endDay: "",
      affectedDays: [] as string[]
    }
  });

  const goalForm = useForm({
    defaultValues: {
      minValue: 0,
      maxValue: 0,
      increasePercent: 0,
      months: [] as string[]
    }
  });

  const weekdays = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];
  
  // Add a navigation tab for direct panel access
  const navigationTabs = [
    { id: "panel", label: "Painel" },
    { id: "adicionais", label: "Adicionais" },
    { id: "descontos", label: "Descontos" },
    { id: "metas", label: "Metas" },
  ];
  
  const handleTabChange = (value: string) => {
    if (value === "panel") {
      setViewMode("panel");
    } else {
      setActiveTab(value);
      setViewMode("card");
    }
  };

  return (
    <DashboardLayout title="Metas e Preços" subtitle="Gerencie as metas e preços do espaço">
      <div className="space-y-8">
        {/* Navigation tabs with panel option first */}
        <div className="bg-gray-100 p-1 rounded-lg">
          <div className="grid grid-cols-4 gap-1">
            {navigationTabs.map((tab) => (
              <Button 
                key={tab.id}
                variant={
                  (tab.id === "panel" && viewMode === "panel") || 
                  (tab.id === activeTab && viewMode === "card") 
                    ? "default" 
                    : "ghost"
                }
                className={
                  (tab.id === "panel" && viewMode === "panel") || 
                  (tab.id === activeTab && viewMode === "card")
                    ? "bg-primary text-white" 
                    : "bg-transparent text-gray-600"
                }
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.id === "panel" ? <LayoutGrid className="h-4 w-4 mr-1" /> : null}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Panel View */}
        {viewMode === "panel" && (
          <div className="space-y-6">
            {/* Pricing Model Section */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">Modelo de Preços</h2>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Preços
                </Button>
              </div>
              
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Modelo de Precificação</CardTitle>
                  <CardDescription>O modelo de preço atual para o espaço.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full md:w-1/3">
                    <div className="p-6 border rounded-lg bg-white">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Preço por Diária</h3>
                          <p className="text-2xl font-bold text-primary mt-1">
                            {pricingModel.pricePerDay.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <p className="flex items-center mt-2">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Hora extra: {pricingModel.extraHourPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            {/* Goals Section */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">Metas</h2>
                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Meta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nova Meta</DialogTitle>
                      <DialogDescription>
                        Crie uma nova meta para o seu espaço.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="minValue">Mínimo</Label>
                        <Input id="minValue" placeholder="R$0.00" className="bg-white border" />
                      </div>
                      <div>
                        <Label htmlFor="maxValue">Máximo</Label>
                        <Input id="maxValue" placeholder="R$0.00" className="bg-white border" />
                      </div>
                      <div>
                        <Label htmlFor="increasePercent">Taxa de Aumento (%):</Label>
                        <Input id="increasePercent" placeholder="0%" className="bg-white border" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Selecione os Meses:</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {months.map((month) => (
                            <div key={month} className="flex items-center space-x-2">
                              <Checkbox id={`month-${month}`} value={month} />
                              <Label htmlFor={`month-${month}`} className="text-sm">{month}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setGoalDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                          Cadastrar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <Card key={goal.id} className="bg-white border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{goal.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{goal.period}</p>
                        </div>
                        <div className="bg-gray-100 p-1 rounded">
                          {goal.type === "revenue" ? (
                            <TrendingUp className="h-5 w-5 text-primary" />
                          ) : (
                            <Calendar className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 mb-1">Progresso</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${goal.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-sm font-medium">{goal.percentage}%</div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 text-sm">
                        <div>
                          <div className="text-gray-600">Atual:</div>
                          <div className="font-medium">
                            {goal.type === "revenue" 
                              ? `R$ ${goal.current.toLocaleString('pt-BR')}`
                              : `${goal.current} ${goal.unit}`
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Meta:</div>
                          <div className="font-medium">
                            {goal.type === "revenue" 
                              ? `R$ ${goal.target.toLocaleString('pt-BR')}`
                              : `${goal.target} ${goal.unit}`
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            
            {/* Adicionais Section */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">Adicionais</h2>
                <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Adicional
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Novo Adicional</DialogTitle>
                      <DialogDescription>
                        Crie um novo adicional para o seu espaço.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo da Taxa:</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="temporada" 
                              checked={feeForm.watch("type") === "SEASONAL"}
                              onCheckedChange={() => feeForm.setValue("type", "SEASONAL")}
                            />
                            <label htmlFor="temporada" className="text-sm">Temporada</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="diasSemana" 
                              checked={feeForm.watch("type") === "WEEKDAY"}
                              onCheckedChange={() => feeForm.setValue("type", "WEEKDAY")}
                            />
                            <label htmlFor="diasSemana" className="text-sm">Dias da semana</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" placeholder="Título do adicional" className="bg-white border" />
                      </div>
                      
                      <div>
                        <Label htmlFor="fee">Taxa de Aumento (%):</Label>
                        <Input id="fee" type="number" defaultValue={0} className="bg-white border" />
                      </div>
                      
                      {feeForm.watch("type") === "SEASONAL" && (
                        <>
                          <div>
                            <Label htmlFor="startDate">Data do Início da Temporada:</Label>
                            <Input
                              id="startDate"
                              placeholder="Escolha a data de início da temporada"
                              className="bg-white border"
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate">Data do Fim da Temporada:</Label>
                            <Input
                              id="endDate"
                              placeholder="Escolha a data de fim da temporada"
                              className="bg-white border"
                            />
                          </div>
                        </>
                      )}
                      
                      {feeForm.watch("type") === "WEEKDAY" && (
                        <div className="space-y-3">
                          <Label>Selecione os Dias:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {weekdays.map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox id={day} value={day} />
                                <Label htmlFor={day} className="text-sm">{day}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setFeeDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                          Cadastrar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {seasonalFees.map((fee) => (
                  <Card key={fee.id} className="bg-white border hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">{fee.title}</h3>
                          {fee.type === "SEASONAL" && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{fee.startDay} até {fee.endDay}</span>
                            </div>
                          )}
                          {fee.type === "WEEKDAY" && (
                            <div className="text-sm text-gray-600 mt-1">
                              {fee.affectedDays?.split(',').join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-green-500">
                          + {fee.fee} %
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            
            {/* Descontos Section */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">Descontos</h2>
                <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Desconto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Novo Desconto</DialogTitle>
                      <DialogDescription>
                        Crie um novo desconto para o seu espaço.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo do Desconto:</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="temporada-discount" 
                              checked={discountForm.watch("type") === "SEASONAL"}
                              onCheckedChange={() => discountForm.setValue("type", "SEASONAL")}
                            />
                            <label htmlFor="temporada-discount" className="text-sm">Temporada</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="diasSemana-discount" 
                              checked={discountForm.watch("type") === "WEEKDAY"}
                              onCheckedChange={() => discountForm.setValue("type", "WEEKDAY")}
                            />
                            <label htmlFor="diasSemana-discount" className="text-sm">Dias da semana</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="title-discount">Título</Label>
                        <Input id="title-discount" placeholder="Título do desconto" className="bg-white border" />
                      </div>
                      
                      <div>
                        <Label htmlFor="fee-discount">Taxa de Desconto (%):</Label>
                        <Input id="fee-discount" type="number" defaultValue={0} className="bg-white border" />
                      </div>
                      
                      {discountForm.watch("type") === "SEASONAL" && (
                        <>
                          <div>
                            <Label htmlFor="startDate-discount">Data do Início da Temporada:</Label>
                            <Input
                              id="startDate-discount"
                              placeholder="Escolha a data de início da temporada"
                              className="bg-white border"
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate-discount">Data do Fim da Temporada:</Label>
                            <Input
                              id="endDate-discount"
                              placeholder="Escolha a data de fim da temporada"
                              className="bg-white border"
                            />
                          </div>
                        </>
                      )}
                      
                      {discountForm.watch("type") === "WEEKDAY" && (
                        <div className="space-y-3">
                          <Label>Selecione os Dias:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {weekdays.map((day) => (
                              <div key={`discount-${day}`} className="flex items-center space-x-2">
                                <Checkbox id={`discount-${day}`} value={day} />
                                <Label htmlFor={`discount-${day}`} className="text-sm">{day}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDiscountDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                          Cadastrar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {discounts.map((discount) => (
                  <Card key={discount.id} className="bg-white border hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">{discount.title}</h3>
                          {discount.type === "SEASONAL" && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{discount.startDay} até {discount.endDay}</span>
                            </div>
                          )}
                          {discount.type === "WEEKDAY" && (
                            <div className="text-sm text-gray-600 mt-1">
                              {discount.affectedDays?.split(',').join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-red-500">
                          {discount.fee} %
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}
        
        {/* Card View with Tabs */}
        {viewMode === "card" && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="adicionais" className="text-sm">ADICIONAIS</TabsTrigger>
              <TabsTrigger value="descontos" className="text-sm">DESCONTOS</TabsTrigger>
              <TabsTrigger value="metas" className="text-sm">METAS</TabsTrigger>
            </TabsList>
            
            {/* ADICIONAIS TAB */}
            <TabsContent value="adicionais" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Adicional
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Novo Adicional</DialogTitle>
                      <DialogDescription>
                        Crie um novo adicional para o seu espaço.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo da Taxa:</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="temporada" 
                              checked={feeForm.watch("type") === "SEASONAL"}
                              onCheckedChange={() => feeForm.setValue("type", "SEASONAL")}
                            />
                            <label htmlFor="temporada" className="text-sm">Temporada</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="diasSemana" 
                              checked={feeForm.watch("type") === "WEEKDAY"}
                              onCheckedChange={() => feeForm.setValue("type", "WEEKDAY")}
                            />
                            <label htmlFor="diasSemana" className="text-sm">Dias da semana</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" placeholder="Título do adicional" className="bg-white border" />
                      </div>
                      
                      <div>
                        <Label htmlFor="fee">Taxa de Aumento (%):</Label>
                        <Input id="fee" type="number" defaultValue={0} className="bg-white border" />
                      </div>
                      
                      {feeForm.watch("type") === "SEASONAL" && (
                        <>
                          <div>
                            <Label htmlFor="startDate">Data do Início da Temporada:</Label>
                            <Input
                              id="startDate"
                              placeholder="Escolha a data de início da temporada"
                              className="bg-white border"
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate">Data do Fim da Temporada:</Label>
                            <Input
                              id="endDate"
                              placeholder="Escolha a data de fim da temporada"
                              className="bg-white border"
                            />
                          </div>
                        </>
                      )}
                      
                      {feeForm.watch("type") === "WEEKDAY" && (
                        <div className="space-y-3">
                          <Label>Selecione os Dias:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {weekdays.map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox id={day} value={day} />
                                <Label htmlFor={day} className="text-sm">{day}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setFeeDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                          Cadastrar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mb-4">
                <Input
                  placeholder="Filtrar..."
                  className="max-w-sm bg-white"
                />
              </div>

              <div className="space-y-4">
                {seasonalFees.map((fee) => (
                  <Card key={fee.id} className="bg-white border hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">{fee.title}</h3>
                          {fee.type === "SEASONAL" && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{fee.startDay} até {fee.endDay}</span>
                            </div>
                          )}
                          {fee.type === "WEEKDAY" && (
                            <div className="text-sm text-gray-600 mt-1">
                              {fee.affectedDays?.split(',').join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-green-500">
                          + {fee.fee} %
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* DESCONTOS TAB */}
            <TabsContent value="descontos" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Desconto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Novo Desconto</DialogTitle>
                      <DialogDescription>
                        Crie um novo desconto para o seu espaço.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo do Desconto:</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="temporada-discount" 
                              checked={discountForm.watch("type") === "SEASONAL"}
                              onCheckedChange={() => discountForm.setValue("type", "SEASONAL")}
                            />
                            <label htmlFor="temporada-discount" className="text-sm">Temporada</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="diasSemana-discount" 
                              checked={discountForm.watch("type") === "WEEKDAY"}
                              onCheckedChange={() => discountForm.setValue("type", "WEEKDAY")}
                            />
                            <label htmlFor="diasSemana-discount" className="text-sm">Dias da semana</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="title-discount">Título</Label>
                        <Input id="title-discount" placeholder="Título do desconto" className="bg-white border" />
                      </div>
                      
                      <div>
                        <Label htmlFor="fee-discount">Taxa de Desconto (%):</Label>
                        <Input id="fee-discount" type="number" defaultValue={0} className="bg-white border" />
                      </div>
                      
                      {discountForm.watch("type") === "SEASONAL" && (
                        <>
                          <div>
                            <Label htmlFor="startDate-discount">Data do Início da Temporada:</Label>
                            <Input
                              id="startDate-discount"
                              placeholder="Escolha a data de início da temporada"
                              className="bg-white border"
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate-discount">Data do Fim da Temporada:</Label>
                            <Input
                              id="endDate-discount"
                              placeholder="Escolha a data de fim da temporada"
                              className="bg-white border"
                            />
                          </div>
                        </>
                      )}
                      
                      {discountForm.watch("type") === "WEEKDAY" && (
                        <div className="space-y-3">
                          <Label>Selecione os Dias:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {weekdays.map((day) => (
                              <div key={`discount-${day}`} className="flex items-center space-x-2">
                                <Checkbox id={`discount-${day}`} value={day} />
                                <Label htmlFor={`discount-${day}`} className="text-sm">{day}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDiscountDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                          Cadastrar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mb-4">
                <Input
                  placeholder="Filtrar..."
                  className="max-w-sm bg-white"
                />
              </div>

              <div className="space-y-4">
                {discounts.map((discount) => (
                  <Card key={discount.id} className="bg-white border hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">{discount.title}</h3>
                          {discount.type === "SEASONAL" && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{discount.startDay} até {discount.endDay}</span>
                            </div>
                          )}
                          {discount.type === "WEEKDAY" && (
                            <div className="text-sm text-gray-600 mt-1">
                              {discount.affectedDays?.split(',').join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-red-500">
                          {discount.fee} %
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* METAS TAB */}
            <TabsContent value="metas" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                {/* View toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md">
                  <Button 
                    variant={viewMode === "card" ? "default" : "ghost"} 
                    size="sm"
                    className={viewMode === "card" ? "bg-primary text-white" : "bg-transparent text-gray-600"}
                    onClick={() => setViewMode("card")}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" /> 
                    Cards
                  </Button>
                  <Button 
                    variant={viewMode === "panel" ? "default" : "ghost"} 
                    size="sm"
                    className={viewMode === "panel" ? "bg-primary text-white" : "bg-transparent text-gray-600"}
                    onClick={() => setViewMode("panel")}
                  >
                    <List className="h-4 w-4 mr-1" /> 
                    Painel
                  </Button>
                </div>
                
                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Meta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nova Meta</DialogTitle>
                      <DialogDescription>
                        Crie uma nova meta para o seu espaço.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="minValue">Mínimo</Label>
                        <Input id="minValue" placeholder="R$0.00" className="bg-white border" />
                      </div>
                      <div>
                        <Label htmlFor="maxValue">Máximo</Label>
                        <Input id="maxValue" placeholder="R$0.00" className="bg-white border" />
                      </div>
                      <div>
                        <Label htmlFor="increasePercent">Taxa de Aumento (%):</Label>
                        <Input id="increasePercent" placeholder="0%" className="bg-white border" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Selecione os Meses:</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {months.map((month) => (
                            <div key={month} className="flex items-center space-x-2">
                              <Checkbox id={`month-${month}`} value={month} />
                              <Label htmlFor={`month-${month}`} className="text-sm">{month}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setGoalDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                          Cadastrar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {viewMode === "card" ? (
                <>
                  <div className="mb-4">
                    <Input
                      placeholder="Filtrar..."
                      className="max-w-sm bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map((goal) => (
                      <Card key={goal.id} className="bg-white border shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-lg text-gray-800">{goal.title}</h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{goal.period}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Progress value={getPercentage(goal.current, goal.target)} className="h-2" />
                            <div className="flex justify-between mt-2 text-sm">
                              <span>Progresso: {getPercentage(goal.current, goal.target)}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <div>
                              <div className="text-sm text-gray-600">Atual:</div>
                              <div className="font-medium">
                                {goal.type === "revenue" 
                                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.current)
                                  : `${goal.current} ${goal.unit}`
                                }
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Meta:</div>
                              <div className="font-medium">
                                {goal.type === "revenue" 
                                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target)
                                  : `${goal.target} ${goal.unit}`
                                }
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                // Panel view based on the image reference
                <div className="space-y-6">
                  {/* Pricing Model Section */}
                  <section className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-medium text-gray-800">Modelo de Preços</h2>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Preços
                      </Button>
                    </div>
                    
                    <Card className="border shadow-sm">
                      <CardHeader>
                        <CardTitle>Modelo de Precificação</CardTitle>
                        <CardDescription>O modelo de preço atual para o espaço.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full md:w-1/3">
                          <div className="p-6 border rounded-lg bg-white">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">Preço por Diária</h3>
                                <p className="text-2xl font-bold text-primary mt-1">
                                  {pricingModel.pricePerDay.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                              <p className="flex items-center mt-2">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Hora extra: {pricingModel.extraHourPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                  
                  {/* Goals Section */}
                  <section className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-medium text-gray-800">Metas</h2>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Meta
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {goals.map((goal) => (
                        <Card key={goal.id} className="bg-white border shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">{goal.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{goal.period}</p>
                              </div>
                              <div className="bg-gray-100 p-1 rounded">
                                {goal.type === "revenue" ? (
                                  <TrendingUp className="h-5 w-5 text-primary" />
                                ) : (
                                  <Calendar className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <div className="text-xs text-gray-600 mb-1">Progresso</div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${goal.percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-right text-sm font-medium">{goal.percentage}%</div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4 text-sm">
                              <div>
                                <div className="text-gray-600">Atual:</div>
                                <div className="font-medium">
                                  {goal.type === "revenue" 
                                    ? `R$ ${goal.current.toLocaleString('pt-BR')}`
                                    : `${goal.current} ${goal.unit}`
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Meta:</div>
                                <div className="font-medium">
                                  {goal.type === "revenue" 
                                    ? `R$ ${goal.target.toLocaleString('pt-BR')}`
                                    : `${goal.target} ${goal.unit}`
                                  }
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>
              )}
              
              {viewMode === "card" && (
                <Card className="bg-white border shadow-sm mt-4">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">Período:</div>
                      <div className="flex flex-wrap gap-2">
                        {months.map(month => (
                          <span key={month} className="text-sm text-gray-800">{month}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-800">
                          <div>Meta: R$ 10.000 /</div>
                        </div>
                        <div className="text-green-500">
                          Acréscimo: 10 %
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Existing Pricing Section - hidden when in tabs view */}
        {false && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Modelo de Preços
              </h2>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar Preços
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Modelo de Precificação</CardTitle>
                <CardDescription>O modelo de preço atual para o espaço.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pricingModel.model === "pricePerDay" && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-eventhub-tertiary/20 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-eventhub-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Preço por Diária</h3>
                          <p className="text-2xl font-bold text-eventhub-primary mt-1">
                            {pricingModel.pricePerDay?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <p className="flex items-center mt-2">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Hora extra: {pricingModel.extraHourPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {pricingModel.model === "pricePerPerson" && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-eventhub-tertiary/20 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-eventhub-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Preço por Pessoa</h3>
                          <p className="text-2xl font-bold text-eventhub-primary mt-1">
                            {pricingModel.pricePerPerson?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
