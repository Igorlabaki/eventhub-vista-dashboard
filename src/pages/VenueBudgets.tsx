
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { BudgetDetails } from "@/components/BudgetDetails";

// Mock data for budgets
const mockBudgets = [
  {
    id: "1",
    clientName: "Diferente Agencia",
    eventDate: new Date(2020, 11, 20), // 20/12/2020
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
  },
  {
    id: "2",
    clientName: "Maria e João",
    eventDate: new Date(2023, 5, 15), // 15/06/2023
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
  },
  {
    id: "3",
    clientName: "Pedro Silva",
    eventDate: new Date(2023, 8, 10), // 10/09/2023
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
  }
];

export default function VenueBudgets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<typeof mockBudgets[0] | null>(null);
  const navigate = useNavigate();

  // Filter budgets based on search term
  const filteredBudgets = mockBudgets.filter(budget => 
    budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle opening budget details
  const handleOpenBudgetDetails = (budget: typeof mockBudgets[0]) => {
    setSelectedBudget(budget);
  };

  // Close budget details dialog
  const handleCloseBudgetDetails = () => {
    setSelectedBudget(null);
  };

  // Create a new budget
  const handleCreateNewBudget = () => {
    navigate('/venue/new-budget');
  };

  return (
    <DashboardLayout title="Orçamentos" subtitle="Gerencie seus orçamentos">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar orçamentos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateNewBudget} className="ml-4">
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
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
              filteredBudgets.map((budget) => (
                <TableRow 
                  key={budget.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleOpenBudgetDetails(budget)}
                >
                  <TableCell className="font-medium">{budget.clientName}</TableCell>
                  <TableCell>
                    {format(budget.eventDate, "dd/MM/yyyy", { locale: pt })}
                  </TableCell>
                  <TableCell>{budget.eventType}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(budget.totalValue)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum orçamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Budget details dialog */}
      {selectedBudget && (
        <Dialog open={!!selectedBudget} onOpenChange={handleCloseBudgetDetails}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Orçamento</DialogTitle>
            </DialogHeader>
            <BudgetDetails budget={selectedBudget} onClose={handleCloseBudgetDetails} />
          </DialogContent>
        </Dialog>
      )}

      <FloatingActionButton onClick={handleCreateNewBudget} label="Novo Orçamento" />
    </DashboardLayout>
  );
}
