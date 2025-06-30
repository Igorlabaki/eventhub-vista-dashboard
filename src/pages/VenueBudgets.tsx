import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { BudgetDetails } from "@/components/BudgetDetails";
import { BudgetSidebar } from "@/components/BudgetSidebar";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { FilterList } from "@/components/filterList";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { MonthYearNavigator } from "@/components/proposal/MonthYearNavigator";
import { ProposalTable } from "@/components/proposal/ProposalTable";
import { PerDayProposalForm } from "@/components/proposal/forms/PerDayProposalForm";
import { PerPersonProposalForm } from "@/components/proposal/forms/PerPersonProposalForm";
import { PageHeader } from "@/components/PageHeader";
import { useUserStore } from "@/store/userStore";

// Month names in Portuguese
const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const TableSkeleton = () => {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data do Evento</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function VenueBudgets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedVenue, fetchVenueById } = useVenueStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const { id: venueIdParam } = useParams();
  const { user } = useUserStore();

  const { 
    proposals, 
    isLoading, 
    error,
    fetchProposals,
    fetchProposalById 
  } = useProposalStore();

  // Handle opening proposal details
  const handleOpenProposalDetails = (proposal) => {
    setSelectedProposal(proposal);
  };

  // Close proposal details
  const handleCloseProposalDetails = () => {
    setSelectedProposal(null);
    navigate('/venue/budgets');
  };

  // Create a new proposal
  const handleCreateNewProposal = () => {
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
  };

  // Effect to handle URL parameters
  useEffect(() => {
    const proposalId = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (proposalId && action === 'view') {
      fetchProposalById(proposalId);
    }
  }, [searchParams]);

  // Effect to fetch proposals when month/year changes
  useEffect(() => {
    fetchProposals({
      venueId: selectedVenue.id,
      month: (selectedMonth + 1).toString(),
      year: selectedYear.toString()
    });
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    // Se não houver selectedVenue, tenta buscar pelo id da URL
    if (!selectedVenue && venueIdParam && user?.id) {
      fetchVenueById(venueIdParam, user.id);
    }
  }, [selectedVenue, venueIdParam, user?.id, fetchVenueById]);

  const renderProposalList = () => (
    <>
      <PageHeader
        onCreateClick={handleCreateNewProposal}
        createButtonText="Novo Orçamento"
        isFormOpen={showForm}
      />

      <MonthYearNavigator
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        monthNames={monthNames}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      <FilterList
        items={proposals.filter(
          proposal =>
            new Date(proposal.startDate).getMonth() === selectedMonth &&
            new Date(proposal.startDate).getFullYear() === selectedYear
        )}
        filterBy={(proposal, query) =>
          proposal.completeClientName.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar orçamentos..."
      >
        {(filteredProposals) => (
          <>
            <div className="mb-2 text-sm text-gray-500">
              {filteredProposals.length} orçamentos
            </div>
            <ProposalTable
              proposals={filteredProposals}
              isLoading={isLoading}
              monthNames={monthNames}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </>
        )}
      </FilterList>
    </>
  );

  const renderProposalForm = () => {
    if (selectedVenue.hasOvernightStay) {
      return <PerDayProposalForm venueId={selectedVenue.id} onBack={handleBackToList} />;
    }
    return <PerPersonProposalForm venueId={selectedVenue.id} onBack={handleBackToList} />;
  };

  // Se ainda não carregou o selectedVenue, mostra loading
  if (!selectedVenue) {
    return <div className="text-center py-16 text-gray-500">Carregando informações do espaço...</div>;
  }

  return (
    <DashboardLayout title="Orçamentos" subtitle="Gerencie seus orçamentos">
      {!selectedProposal ? (
        <>
          <AnimatedFormSwitcher
            showForm={showForm}
            list={renderProposalList()}
            form={renderProposalForm()}
          />
        </>
      ) : (
        <div className="flex w-full">
          <BudgetSidebar onBack={handleCloseProposalDetails} proposal={selectedProposal} />
          <div className="flex-1 p-6">
            <BudgetDetails proposal={selectedProposal} onClose={handleCloseProposalDetails} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
