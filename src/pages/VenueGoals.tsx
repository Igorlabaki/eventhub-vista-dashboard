
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, TrendingUp, Calendar, DollarSign, Edit, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function VenueGoals() {
  const [goals, setGoals] = useState([
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

  return (
    <DashboardLayout title="Metas e Preços" subtitle="Gerencie as metas e preços do espaço">
      <div className="space-y-8">
        {/* Pricing Section */}
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

        {/* Goals Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Metas
            </h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const percentage = getPercentage(goal.current, goal.target);
              return (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      <div className="w-10 h-10 rounded-full bg-eventhub-tertiary/20 flex items-center justify-center">
                        {goal.type === 'revenue' ? (
                          <TrendingUp className="h-5 w-5 text-eventhub-primary" />
                        ) : (
                          <Calendar className="h-5 w-5 text-eventhub-primary" />
                        )}
                      </div>
                    </div>
                    <CardDescription>{goal.period}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Progresso</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center pt-2 text-sm">
                        <div>
                          <span className="text-gray-500">Atual:</span>
                          <span className="ml-1 font-medium">
                            {goal.type === 'revenue' ? goal.unit : ''} {goal.current.toLocaleString('pt-BR')} {goal.type !== 'revenue' ? goal.unit : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Meta:</span>
                          <span className="ml-1 font-medium">
                            {goal.type === 'revenue' ? goal.unit : ''} {goal.target.toLocaleString('pt-BR')} {goal.type !== 'revenue' ? goal.unit : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
