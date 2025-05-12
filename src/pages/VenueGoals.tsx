
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, TrendingUp, Calendar, DollarSign, Edit, Users, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

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
  const [activeTab, setActiveTab] = useState("metas");
  
  const [goals, setGoals] = useState<any[]>([
    { 
      id: "1", 
      title: "Meta Mensal", 
      target: 50000, 
      current: 32500, 
      unit: "R$", 
      period: "Mai/2025",
      type: "revenue" 
    },
    { 
      id: "2", 
      title: "Eventos no Mês", 
      target: 8, 
      current: 5, 
      unit: "eventos", 
      period: "Mai/2025",
      type: "events" 
    },
    { 
      id: "3", 
      title: "Meta Anual", 
      target: 500000, 
      current: 180000, 
      unit: "R$", 
      period: "2025",
      type: "revenue" 
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

  const [newGoalFormOpen, setNewGoalFormOpen] = useState(false);
  const [newFeeFormOpen, setNewFeeFormOpen] = useState(false);
  const [newDiscountFormOpen, setNewDiscountFormOpen] = useState(false);
  
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

  const handleAddFee = () => {
    setNewFeeFormOpen(true);
  };

  const handleAddDiscount = () => {
    setNewDiscountFormOpen(true);
  };

  const handleAddGoal = () => {
    setNewGoalFormOpen(true);
  };

  return (
    <DashboardLayout title="Metas e Preços" subtitle="Gerencie as metas e preços do espaço">
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="adicionais" className="text-sm">ADICIONAIS</TabsTrigger>
            <TabsTrigger value="descontos" className="text-sm">DESCONTOS</TabsTrigger>
            <TabsTrigger value="metas" className="text-sm">METAS</TabsTrigger>
          </TabsList>
          
          {/* ADICIONAIS TAB */}
          <TabsContent value="adicionais" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Button className="bg-eventhub-primary hover:bg-indigo-600 text-white" onClick={handleAddFee}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Adicional
              </Button>
            </div>
            
            <div className="mb-4">
              <Input
                placeholder="Filtrar..."
                className="max-w-sm bg-white"
              />
            </div>

            <div className="space-y-4">
              {seasonalFees.map((fee) => (
                <Card key={fee.id} className="bg-white border hover:bg-secondary/50 transition-colors cursor-pointer shadow-sm">
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

            {newFeeFormOpen && (
              <Card className="border bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Novo Adicional</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo do Taxa:</Label>
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
                      <Input id="title" placeholder="Required" className="bg-white border" />
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
                            placeholder="Escolha a data de início da temporada"
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
                    
                    <Button className="w-full bg-eventhub-primary hover:bg-indigo-600 text-white">
                      Cadastrar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* DESCONTOS TAB */}
          <TabsContent value="descontos" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Button className="bg-eventhub-primary hover:bg-indigo-600 text-white" onClick={handleAddDiscount}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Desconto
              </Button>
            </div>
            
            <div className="mb-4">
              <Input
                placeholder="Filtrar..."
                className="max-w-sm bg-white"
              />
            </div>

            <div className="space-y-4">
              {discounts.map((discount) => (
                <Card key={discount.id} className="bg-white border hover:bg-secondary/50 transition-colors cursor-pointer shadow-sm">
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

            {newDiscountFormOpen && (
              <Card className="border bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Novo Desconto</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo do Taxa:</Label>
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
                      <Input id="title-discount" placeholder="Required" className="bg-white border" />
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
                            placeholder="Escolha a data de início da temporada"
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
                    
                    <Button className="w-full bg-eventhub-primary hover:bg-indigo-600 text-white">
                      Cadastrar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* METAS TAB */}
          <TabsContent value="metas" className="space-y-4">
            {/* Standard Goals UI with cards */}
            <div className="flex justify-between items-center mb-4">
              <Button className="bg-eventhub-primary hover:bg-indigo-600 text-white" onClick={handleAddGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </div>
            
            <div className="mb-4">
              <Input
                placeholder="Filtrar..."
                className="max-w-sm bg-white"
              />
            </div>

            <Card className="bg-white border hover:bg-secondary/50 transition-colors cursor-pointer shadow-sm">
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

            {newGoalFormOpen && (
              <Card className="border bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Nova Meta</CardTitle>
                </CardHeader>
                <CardContent>
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
                      <Input id="increasePercent" placeholder="Required" className="bg-white border" />
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
                    
                    <Button className="w-full bg-eventhub-primary hover:bg-indigo-600 text-white">
                      Cadastrar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

          </TabsContent>
        </Tabs>
        
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
