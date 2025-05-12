
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VenueReports() {
  const [year, setYear] = useState(2025);
  const [activeTab, setActiveTab] = useState("eventos");
  
  // Estatísticas para a aba de eventos
  const eventStats = {
    totalEvents: 12,
    averageGuests: 32,
    conversionRate: 4.7,
    sourceData: [
      { source: "Airbnb", count: 5, percentage: 42 },
      { source: "Instagram", count: 3, percentage: 25 },
      { source: "Outros", count: 2, percentage: 17 },
      { source: "Google", count: 1, percentage: 8 },
      { source: "TikTok", count: 1, percentage: 8 },
    ]
  };
  
  // Estatísticas para a aba de orçamentos
  const budgetStats = {
    totalBudgets: 253,
    averageGuests: 52,
    conversionRate: 4.7,
    sourceData: [
      { source: "Instagram", count: 108, percentage: 43 },
      { source: "TikTok", count: 58, percentage: 23 },
      { source: "Outros", count: 45, percentage: 18 },
      { source: "Google", count: 22, percentage: 9 },
      { source: "Amigos", count: 13, percentage: 5 },
      { source: "Airbnb", count: 5, percentage: 2 },
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
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Eventos</p>
                  <p className="text-2xl font-bold">{eventStats.totalEvents}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">P/ pessoa</p>
                  <p className="text-2xl font-bold">{eventStats.averageGuests} pessoas</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Taxa de conversão</p>
                  <p className="text-2xl font-bold">{eventStats.conversionRate}%</p>
                </div>
              </div>
              
              {renderSourceData(eventStats.sourceData)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orcamentos">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Orçamentos</p>
                  <p className="text-2xl font-bold">{budgetStats.totalBudgets}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">P/ pessoa</p>
                  <p className="text-2xl font-bold">{budgetStats.averageGuests} pessoas</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Taxa de conversão</p>
                  <p className="text-2xl font-bold">{budgetStats.conversionRate}%</p>
                </div>
              </div>
              
              {renderSourceData(budgetStats.sourceData)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financeiro">
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
