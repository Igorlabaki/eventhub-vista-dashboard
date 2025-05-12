
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { Bar, BarChart as RechartBar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function VenueReports() {
  const [year, setYear] = useState(2025);
  const [activeTab, setActiveTab] = useState("eventos");
  
  // Dados mensais para eventos e orçamentos
  const monthlyData = [
    { name: "Jan", eventos: 3, orcamentos: 23, valor: 8000, mes: 1, percentualEventos: 24, percentualOrcamentos: 9 },
    { name: "Fev", eventos: 3, orcamentos: 51, valor: 12500, mes: 2, percentualEventos: 25, percentualOrcamentos: 20 },
    { name: "Mar", eventos: 2, orcamentos: 48, valor: 9800, mes: 3, percentualEventos: 19, percentualOrcamentos: 19 },
    { name: "Abr", eventos: 1, orcamentos: 31, valor: 6700, mes: 4, percentualEventos: 5, percentualOrcamentos: 12 },
    { name: "Mai", eventos: 0, orcamentos: 21, valor: 0, mes: 5, percentualEventos: 0, percentualOrcamentos: 8 },
    { name: "Jun", eventos: 0, orcamentos: 15, valor: 0, mes: 6, percentualEventos: 0, percentualOrcamentos: 6 },
    { name: "Jul", eventos: 0, orcamentos: 13, valor: 0, mes: 7, percentualEventos: 0, percentualOrcamentos: 5 },
    { name: "Ago", eventos: 3, orcamentos: 18, valor: 11200, mes: 8, percentualEventos: 23, percentualOrcamentos: 7 },
    { name: "Set", eventos: 0, orcamentos: 12, valor: 0, mes: 9, percentualEventos: 0, percentualOrcamentos: 5 },
    { name: "Out", eventos: 0, orcamentos: 9, valor: 0, mes: 10, percentualEventos: 0, percentualOrcamentos: 4 },
    { name: "Nov", eventos: 0, orcamentos: 8, valor: 0, mes: 11, percentualEventos: 0, percentualOrcamentos: 3 },
    { name: "Dez", eventos: 0, orcamentos: 4, valor: 0, mes: 12, percentualEventos: 0, percentualOrcamentos: 2 },
  ];
  
  // Estatísticas para a aba de eventos
  const eventStats = {
    totalEvents: 12,
    averageGuests: 32,
    conversionRate: 4.7,
    averageValue: 4920.83,
    averageValuePerPerson: 154.18,
    sourceData: [
      { source: "Airbnb", count: 5, percentage: 42 },
      { source: "Instagram", count: 3, percentage: 25 },
      { source: "Outros", count: 2, percentage: 17 },
      { source: "Google", count: 1, percentage: 8 },
      { source: "TikTok", count: 1, percentage: 8 },
      { source: "Facebook", count: 0, percentage: 0 },
      { source: "Amigos", count: 0, percentage: 0 },
    ]
  };
  
  // Estatísticas para a aba de orçamentos
  const budgetStats = {
    totalBudgets: 253,
    averageGuests: 52,
    conversionRate: 4.7,
    averageValue: 3850.47,
    averageValuePerPerson: 74.05,
    sourceData: [
      { source: "Instagram", count: 108, percentage: 43 },
      { source: "TikTok", count: 58, percentage: 23 },
      { source: "Outros", count: 45, percentage: 18 },
      { source: "Google", count: 22, percentage: 9 },
      { source: "Amigos", count: 13, percentage: 5 },
      { source: "Airbnb", count: 5, percentage: 2 },
      { source: "Facebook", count: 2, percentage: 1 },
    ]
  };

  // Estatísticas para a aba financeira
  const financialStats = {
    recurringExpenses: [
      { name: "IPTU", value: 16320, percentage: 43 },
      { name: "Faxina", value: 6000, percentage: 16 },
      { name: "Água", value: 6000, percentage: 16 },
      { name: "Luz", value: 6000, percentage: 16 },
      { name: "Piscineiro", value: 3960, percentage: 10 },
    ],
    monthlyExpenses: [
      { name: "IPTU", value: 1360, percentage: 43 },
      { name: "Faxina", value: 500, percentage: 16 },
      { name: "Água", value: 500, percentage: 16 },
      { name: "Luz", value: 500, percentage: 16 },
      { name: "Piscineiro", value: 330, percentage: 10 },
    ],
    sporadicExpenses: [
      { name: "Instagram", value: 150, percentage: 100 },
    ],
    monthlyRevenue: 12500,
    yearlyRevenue: 150000,
    profitMargin: 35,
  };
  
  const renderMonthlyBarChart = (dataKey: string, fill: string) => {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <RechartBar
          data={monthlyData}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">{payload[0].payload.name}</div>
                      <div className="font-medium text-right">{payload[0].value}</div>
                      {dataKey === "eventos" ? (
                        <div className="col-span-2 text-xs text-muted-foreground">
                          {payload[0].payload.percentualEventos}% dos eventos
                        </div>
                      ) : (
                        <div className="col-span-2 text-xs text-muted-foreground">
                          {payload[0].payload.percentualOrcamentos}% dos orçamentos
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
        </RechartBar>
      </ResponsiveContainer>
    );
  };
  
  const renderSourceData = (data: Array<{ source: string; count: number; percentage: number }>) => {
    return (
      <div className="space-y-3 mt-4">
        {data.map((item) => (
          <div key={item.source} className="flex items-center">
            <span className="w-24 text-sm">{item.source}:</span>
            <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden mx-2">
              <div 
                className={`h-full ${getBarColor(item.source)}`} 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <span className="text-sm w-10">{item.count}</span>
            <span className="text-sm text-gray-500 w-10 text-right">{item.percentage}%</span>
          </div>
        ))}
      </div>
    );
  };
  
  const getBarColor = (source: string) => {
    switch(source) {
      case "Instagram": return "bg-red-400";
      case "TikTok": return "bg-teal-400";
      case "Google": return "bg-violet-400";
      case "Airbnb": return "bg-purple-400";
      case "Amigos": return "bg-blue-400";
      case "Facebook": return "bg-blue-500";
      default: return "bg-gray-400";
    }
  };
  
  const renderExpenseList = (expenses: Array<{ name: string; value: number; percentage: number }>) => {
    const total = calculateTotal(expenses);
    return (
      <div className="space-y-3 mt-4">
        {expenses.map((expense) => (
          <div key={expense.name} className="flex items-center">
            <span className="w-20 text-sm">{expense.name}:</span>
            <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden mx-2">
              <div 
                className="h-full bg-blue-400" 
                style={{ width: `${expense.percentage}%` }}
              ></div>
            </div>
            <span className="text-sm w-24">R$ {expense.value}</span>
            <span className="text-sm text-gray-500 w-10 text-right">{expense.percentage}%</span>
          </div>
        ))}
        <div className="pt-2 border-t">
          <div className="flex justify-end text-sm font-medium">
            R$ {total}
          </div>
        </div>
      </div>
    );
  };
  
  const calculateTotal = (expenses: Array<{ value: number }>): string => {
    return expenses.reduce((total, expense) => total + expense.value, 0).toLocaleString('pt-BR');
  };
  
  const renderEventMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Eventos</p>
        <p className="text-2xl font-bold">{eventStats.totalEvents}</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">P/ pessoa</p>
        <p className="text-2xl font-bold">{eventStats.averageGuests} pessoas</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Taxa de conversão</p>
        <p className="text-2xl font-bold">{eventStats.conversionRate}%</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">P/ orçamento</p>
        <p className="text-2xl font-bold">R$ {eventStats.averageValue.toLocaleString('pt-BR')}</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg col-span-1 md:col-span-2">
        <p className="text-sm text-gray-500">P/ pessoa</p>
        <p className="text-2xl font-bold">R$ {eventStats.averageValuePerPerson.toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
  
  const renderBudgetMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Orçamentos</p>
        <p className="text-2xl font-bold">{budgetStats.totalBudgets}</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">P/ pessoa</p>
        <p className="text-2xl font-bold">{budgetStats.averageGuests} pessoas</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Taxa de conversão</p>
        <p className="text-2xl font-bold">{budgetStats.conversionRate}%</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">P/ orçamento</p>
        <p className="text-2xl font-bold">R$ {budgetStats.averageValue.toLocaleString('pt-BR')}</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg col-span-1 md:col-span-2">
        <p className="text-sm text-gray-500">P/ pessoa</p>
        <p className="text-2xl font-bold">R$ {budgetStats.averageValuePerPerson.toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
  
  const renderFinancialMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Receita Mensal</p>
        <p className="text-2xl font-bold">R$ {financialStats.monthlyRevenue.toLocaleString('pt-BR')}</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Receita Anual</p>
        <p className="text-2xl font-bold">R$ {financialStats.yearlyRevenue.toLocaleString('pt-BR')}</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Margem de Lucro</p>
        <div className="flex items-center justify-center">
          <p className="text-2xl font-bold">{financialStats.profitMargin}%</p>
          <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
        </div>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Desp. Mensal</p>
        <p className="text-2xl font-bold">R$ 3.190</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Desp. Anual</p>
        <p className="text-2xl font-bold">R$ 38.280</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Lucro Anual</p>
        <p className="text-2xl font-bold">R$ 111.720</p>
      </div>
    </div>
  );
  
  return (
    <DashboardLayout title="Relatórios" subtitle="Analise o desempenho do seu espaço">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setYear(year - 1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-semibold text-lg">{year}</h3>
          <button 
            onClick={() => setYear(year + 1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </div>
      
      <Tabs defaultValue="eventos" className="mb-8">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="eventos" onClick={() => setActiveTab("eventos")}>EVENTOS</TabsTrigger>
          <TabsTrigger value="orcamentos" onClick={() => setActiveTab("orcamentos")}>ORÇAMENTOS</TabsTrigger>
          <TabsTrigger value="financeiro" onClick={() => setActiveTab("financeiro")}>FINANCEIRO</TabsTrigger>
        </TabsList>
        
        <TabsContent value="eventos">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Eventos por Mês - {year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderMonthlyBarChart("eventos", "#3b82f6")}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Análise de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEventMetrics()}
              
              <h3 className="font-medium mb-2 mt-6">Fontes de Origem</h3>
              {renderSourceData(eventStats.sourceData)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orcamentos">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Orçamentos por Mês - {year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderMonthlyBarChart("orcamentos", "#10b981")}
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Análise de Orçamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderBudgetMetrics()}
              
              <h3 className="font-medium mb-2 mt-6">Fontes de Origem</h3>
              {renderSourceData(budgetStats.sourceData)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financeiro">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Análise Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderFinancialMetrics()}
            </CardContent>
          </Card>
        
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Despesas Recorrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium">Anual</h4>
              {renderExpenseList(financialStats.recurringExpenses)}
              
              <h4 className="font-medium mt-8">Mensal</h4>
              {renderExpenseList(financialStats.monthlyExpenses)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Despesas Esporádicas</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium">Anual</h4>
              {renderExpenseList(financialStats.sporadicExpenses)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

