
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, getMonth, getYear } from "date-fns";
import { pt } from "date-fns/locale";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { BudgetDetails } from "@/components/BudgetDetails";
import { BudgetSidebar } from "@/components/BudgetSidebar";

// Mock data for budgets
const mockBudgets = [{
  id: "1",
  clientName: "Diferente Agencia",
  eventDate: new Date(2020, 11, 20),
  eventType: "Confraternização de empresa",
  totalValue: 9000,
  guestCount: 45,
  eventTime: "12:00/21:00",
  details: {
    baseValue: 2571.43,
    extraHour: 1285.71,
    cleaning: 250,
    receptionist: 250,
    security: 250,
    valuePerPerson: 200,
    contactInfo: {
      email: "diferente@gmail.com",
      whatsapp: "(11) 99999-9999",
      hasVisitedVenue: false,
      referralSource: "Outros"
    }
  }
}, {
  id: "2",
  clientName: "Maria e João",
  eventDate: new Date(2023, 5, 15),
  eventType: "Casamento",
  totalValue: 12500,
  guestCount: 100,
  eventTime: "16:00/02:00",
  details: {
    baseValue: 8000,
    extraHour: 2000,
    cleaning: 500,
    receptionist: 500,
    security: 500,
    valuePerPerson: 125,
    contactInfo: {
      email: "mariaejoao@gmail.com",
      whatsapp: "(11) 98888-8888",
      hasVisitedVenue: true,
      referralSource: "Instagram"
    }
  }
}, {
  id: "3",
  clientName: "Pedro Silva",
  eventDate: new Date(2023, 8, 10),
  eventType: "Aniversário 30 anos",
  totalValue: 7500,
  guestCount: 60,
  eventTime: "19:00/01:00",
  details: {
    baseValue: 5000,
    extraHour: 1500,
    cleaning: 250,
    receptionist: 250,
    security: 500,
    valuePerPerson: 125,
    contactInfo: {
      email: "pedro.silva@gmail.com",
      whatsapp: "(11) 97777-7777",
      hasVisitedVenue: false,
      referralSource: "Indicação"
    }
  }
}, {
  id: "4",
  clientName: "Igor Augusto Labaki",
  eventDate: new Date(2025, 4, 16), // May 16, 2025
  eventType: "Casamento",
  totalValue: 6133,
  guestCount: 80,
  eventTime: "16:00/01:00",
  details: {
    baseValue: 4000,
    extraHour: 1000,
    cleaning: 300,
    receptionist: 300,
    security: 533,
    valuePerPerson: 76.66,
    contactInfo: {
      email: "igor.labaki@gmail.com",
      whatsapp: "(11) 97777-1111",
      hasVisitedVenue: true,
      referralSource: "Indicação"
    }
  }
}, {
  id: "5",
  clientName: "Thiago",
  eventDate: new Date(2025, 4, 11), // May 11, 2025
  eventType: "Aniversário",
  totalValue: 4628,
  guestCount: 50,
  eventTime: "19:00/00:00",
  details: {
    baseValue: 3500,
    extraHour: 0,
    cleaning: 250,
    receptionist: 250,
    security: 250,
    valuePerPerson: 92.56,
    contactInfo: {
      email: "thiago@gmail.com",
      whatsapp: "(11) 96666-2222",
      hasVisitedVenue: false,
      referralSource: "Instagram"
    }
  }
}, {
  id: "6",
  clientName: "Emily",
  eventDate: new Date(2025, 4, 24), // May 24, 2025
  eventType: "Confraternização",
  totalValue: 4540,
  guestCount: 35,
  eventTime: "18:00/23:00",
  details: {
    baseValue: 3000,
    extraHour: 0,
    cleaning: 250,
    receptionist: 250,
    security: 250,
    valuePerPerson: 129.71,
    contactInfo: {
      email: "emily@gmail.com",
      whatsapp: "(11) 95555-3333",
      hasVisitedVenue: true,
      referralSource: "Site"
    }
  }
}, {
  id: "7",
  clientName: "Igor Augusto Labaki",
  eventDate: new Date(2025, 4, 1), // May 1, 2025
  eventType: "Formatura",
  totalValue: 5258,
  guestCount: 70,
  eventTime: "19:00/02:00",
  details: {
    baseValue: 3500,
    extraHour: 1000,
    cleaning: 250,
    receptionist: 250,
    security: 258,
    valuePerPerson: 75.11,
    contactInfo: {
      email: "igor.labaki@gmail.com",
      whatsapp: "(11) 97777-1111",
      hasVisitedVenue: false,
      referralSource: "Indicação"
    }
  }
}];

// Month names in Portuguese
const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function VenueBudgets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<typeof mockBudgets[0] | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Filter by month and year
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(4); // May (0-indexed)

  // Get all available years from budgets
  const availableYears = useMemo(() => {
    const years = mockBudgets.map(budget => getYear(budget.eventDate));
    return [...new Set(years)].sort((a, b) => b - a); // Sort descending
  }, []);

  // Filter budgets based on search term, month, and year
  const filteredBudgets = useMemo(() => {
    return mockBudgets.filter(budget => {
      const matchesSearch = 
        budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        budget.eventType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const budgetMonth = getMonth(budget.eventDate);
      const budgetYear = getYear(budget.eventDate);
      
      const matchesMonthAndYear = budgetMonth === selectedMonth && budgetYear === selectedYear;
      
      return matchesSearch && matchesMonthAndYear;
    });
  }, [searchTerm, selectedMonth, selectedYear]);

  // Handle opening budget details
  const handleOpenBudgetDetails = (budget: typeof mockBudgets[0]) => {
    setSelectedBudget(budget);
  };

  // Close budget details
  const handleCloseBudgetDetails = () => {
    setSelectedBudget(null);
    // Clear the URL parameters when closing
    navigate('/venue/budgets');
  };

  // Create a new budget
  const handleCreateNewBudget = () => {
    navigate('/venue/new-budget');
  };

  // Navigate to previous month
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Effect to handle URL parameters
  useEffect(() => {
    const budgetId = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (budgetId && action === 'view') {
      // Find the budget with the matching ID
      const budgetToShow = mockBudgets.find(budget => budget.id === budgetId);
      if (budgetToShow) {
        setSelectedBudget(budgetToShow);
      }
    }
  }, [searchParams]);

  return (
    <DashboardLayout title="Orçamentos" subtitle="Gerencie seus orçamentos">
      {!selectedBudget ? (
        // Show budget list when no budget is selected
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Buscar orçamentos..." 
                className="pl-9" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <Button onClick={handleCreateNewBudget} className="ml-4">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </div>

          {/* Year and Month Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="mx-2 font-medium text-lg">{selectedYear}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {monthNames.map((month, index) => (
                <Button
                  key={month}
                  variant={selectedMonth === index ? "default" : "outline"}
                  className={`${selectedMonth === index ? "bg-primary text-white" : "bg-background"} py-1 px-2 text-sm`}
                  onClick={() => setSelectedMonth(index)}
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>

          {/* Month Navigation for Mobile */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{monthNames[selectedMonth]} {selectedYear}</span>
            <Button variant="ghost" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Budget Count */}
          <div className="mb-4 text-sm text-gray-500">
            {filteredBudgets.length} orçamentos
          </div>

          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data do Evento</TableHead>
                  <TableHead>Tipo de Evento</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map(budget => (
                    <TableRow key={budget.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenBudgetDetails(budget)}>
                      <TableCell className="font-medium">{budget.clientName}</TableCell>
                      <TableCell>
                        {format(budget.eventDate, "dd/MM/yyyy", {
                          locale: pt
                        })}
                      </TableCell>
                      <TableCell>{budget.eventType}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(budget.totalValue)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum orçamento encontrado para {monthNames[selectedMonth]}/{selectedYear}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <FloatingActionButton onClick={handleCreateNewBudget} label="Novo Orçamento" />
        </>
      ) : (
        // Show budget details with sidebar when a budget is selected
        <div className="flex w-full">
          <BudgetSidebar onBack={handleCloseBudgetDetails} budget={selectedBudget} />
          <div className="flex-1 p-6">
            <BudgetDetails budget={selectedBudget} onClose={handleCloseBudgetDetails} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
