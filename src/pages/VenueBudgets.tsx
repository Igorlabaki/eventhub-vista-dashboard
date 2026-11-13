import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar, Link2, Phone, Plus, Search } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { BudgetDetails } from "@/components/BudgetDetails";
import { BudgetSidebar } from "@/components/BudgetSidebar";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { MonthYearNavigator } from "@/components/proposal/MonthYearNavigator";
import { ProposalTable } from "@/components/proposal/ProposalTable";
import { ProposalListPager } from "@/components/proposal/ProposalListPager";
import { ProposalListSummaryCards } from "@/components/proposal/ProposalListSummaryCards";
import { PerDayProposalForm } from "@/components/proposal/forms/PerDayProposalForm";
import { PerPersonProposalForm } from "@/components/proposal/forms/PerPersonProposalForm";
import { PageHeader } from "@/components/PageHeader";
import { useUserStore } from "@/store/userStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccessToast } from "@/components/ui/success-toast";
import { formatWhatsapp } from "@/lib/whatsapp-mask";

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type SortKey = "startDate" | "totalAmount" | "status";

function daysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export default function VenueBudgets() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [whatsappTerm, setWhatsappTerm] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedVenue, fetchVenueById } = useVenueStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "open" | "closed">("");
  const [amountFloorCommit, setAmountFloorCommit] = useState<number | null>(null);
  const [sliderDraft, setSliderDraft] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>("startDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { id: venueIdParam } = useParams();
  const { user } = useUserStore();

  const {
    proposals,
    isLoadingProposals,
    proposalListPagination,
    proposalListSummary,
    proposalListError,
    fetchProposals,
    fetchProposalById,
  } = useProposalStore();

  const handleCloseProposalDetails = () => {
    setSelectedProposal(null);
    navigate("/venue/budgets");
  };

  const handleCreateNewProposal = () => {
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
  };

  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_VENUE_PROPOSALS");
  };

  useEffect(() => {
    const proposalId = searchParams.get("id");
    const action = searchParams.get("action");
    if (proposalId && action === "view") {
      fetchProposalById(proposalId);
    }
  }, [searchParams]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = searchInput.trim();
      setSearchTerm((current) => {
        if (current !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = whatsappInput.trim();
      setWhatsappTerm((current) => {
        if (current !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [whatsappInput]);

  const amountFloor = typeof selectedVenue?.minimumPrice === "number" ? selectedVenue.minimumPrice : 0;
  const amountCeiling = proposalListSummary?.amountMax ?? amountFloor;
  const sliderDisabled = proposalListSummary == null || amountCeiling <= amountFloor;
  const sliderMax = amountCeiling > amountFloor ? amountCeiling : amountFloor + 1;
  const sliderShown = sliderDraft ?? amountFloorCommit ?? amountFloor;
  const approvedFilter = statusFilter === "" ? undefined : statusFilter === "closed";
  const minAmountFilter = amountFloorCommit != null && amountFloorCommit > amountFloor ? amountFloorCommit : undefined;

  const proposalQuery = () => ({
    venueId: selectedVenue?.id ?? "",
    month: String(selectedMonth + 1),
    year: String(selectedYear),
    day: selectedDay === "" ? undefined : String(selectedDay),
    completeClientName: searchTerm || undefined,
    whatsapp: whatsappTerm || undefined,
    page: String(page),
    sortBy,
    sortDir,
    summary: true as const,
    approved: approvedFilter,
    minAmount: minAmountFilter,
  });

  useEffect(() => {
    if (!selectedVenue?.id) return;
    fetchProposals(proposalQuery());
  }, [selectedVenue?.id, selectedMonth, selectedYear, selectedDay, searchTerm, whatsappTerm, page, sortBy, sortDir, approvedFilter, minAmountFilter]);

  useEffect(() => {
    if (!selectedVenue && venueIdParam && user?.id) {
      fetchVenueById(venueIdParam, user.id);
    }
  }, [selectedVenue, venueIdParam, user?.id, fetchVenueById]);

  const resetAmount = () => {
    setAmountFloorCommit(null);
    setSliderDraft(null);
  };

  const changeMonth = (month: number) => {
    setSelectedMonth(month);
    setSelectedDay("");
    resetAmount();
    setPage(1);
  };

  const changeYear = (year: number) => {
    setSelectedYear(year);
    setSelectedDay("");
    resetAmount();
    setPage(1);
  };

  const changeSort = (next: SortKey) => {
    setPage(1);
    if (next === sortBy) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(next);
    setSortDir("asc");
  };

  const retry = () => {
    if (!selectedVenue?.id) return;
    fetchProposals(proposalQuery());
  };

  const renderProposalList = () => (
    <>
      {hasEditPermission() && (
        <PageHeader
          onCreateClick={handleCreateNewProposal}
          createButtonText="Novo Orçamento"
          isFormOpen={showForm}
          hideDesktopButton
        />
      )}
      <div className="mb-6 rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
        <MonthYearNavigator
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          monthNames={monthNames}
          onYearChange={changeYear}
          onMonthChange={changeMonth}
          className="mb-4"
        />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nome..."
              aria-label="Buscar por nome"
              className="h-10 rounded-full bg-white pl-9"
            />
          </div>
          <div className="relative min-w-0 lg:w-64 lg:shrink-0">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={whatsappInput}
              onChange={(event) => setWhatsappInput(formatWhatsapp(event.target.value))}
              placeholder="Buscar por WhatsApp..."
              aria-label="Buscar por WhatsApp"
              inputMode="tel"
              className="h-10 rounded-full bg-white pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-full border-primary/40 bg-white text-primary hover:bg-primary/5 hover:text-primary"
            onClick={async () => {
              const link = `https://event-hub-dashboard.vercel.app/venue/${selectedVenue.id}/form`;
              await navigator.clipboard.writeText(link);
              showSuccessToast({
                title: "Link copiado!",
                description: "O link para o formulário de orçamento foi copiado.",
              });
            }}
          >
            <Link2 className="h-4 w-4" />
            Copiar link do formulário de orçamento
          </Button>
          {hasEditPermission() && (
            <>
              <div className="hidden h-8 w-px shrink-0 bg-border lg:block" />
              <Button
                type="button"
                onClick={handleCreateNewProposal}
                className="hidden h-10 shrink-0 rounded-full bg-eventhub-primary shadow-lg hover:bg-indigo-600 md:inline-flex"
              >
                <Plus className="h-4 w-4" />
                Novo Orçamento
              </Button>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center">
          <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3 text-sm text-foreground">
            Status
            <select
              aria-label="Status"
              className="bg-transparent pr-1 outline-none"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "" | "open" | "closed");
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="open">Aberto</option>
              <option value="closed">Fechado</option>
            </select>
          </label>
          <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3 text-sm text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Dia
            <select
              aria-label="Dia"
              className="bg-transparent pr-1 outline-none"
              value={selectedDay}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedDay(value === "" ? "" : Number(value));
                resetAmount();
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {Array.from({ length: daysInMonth(selectedYear, selectedMonth) }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </label>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="shrink-0 text-sm text-muted-foreground">Valor</span>
            <Slider
              aria-label="Valor mínimo"
              className="min-w-0 flex-1"
              min={amountFloor}
              max={sliderMax}
              step={1}
              disabled={sliderDisabled}
              value={[Math.min(Math.max(sliderShown, amountFloor), sliderMax)]}
              onValueChange={(value) => setSliderDraft(value[0] ?? amountFloor)}
              onValueCommit={(value) => {
                const next = value[0] ?? amountFloor;
                setSliderDraft(null);
                setAmountFloorCommit(next > amountFloor ? next : null);
                setPage(1);
              }}
            />
            <span className="shrink-0 text-sm font-medium tabular-nums">{money.format(sliderShown)}</span>
          </div>
        </div>
        {proposalListSummary != null && amountCeiling <= amountFloor && (
          <p className="mt-2 text-xs text-muted-foreground">Não há valor acima do mínimo neste período.</p>
        )}
      </div>

      <div className="shrink-0">
        <ProposalListSummaryCards summary={proposalListSummary} />
      </div>

      <div className="mb-2 mt-4 text-sm text-muted-foreground">
        {proposalListPagination?.total ?? proposalListSummary?.total ?? 0} orçamentos
      </div>

      {proposalListError && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{proposalListError}</span>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Tentar de novo
          </Button>
        </div>
      )}

      <ProposalTable
        proposals={proposals}
        isLoading={isLoadingProposals}
        monthNames={monthNames}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={changeSort}
      />
      <ProposalListPager
        page={proposalListPagination?.page ?? page}
        totalPages={proposalListPagination?.totalPages ?? 0}
        onPageChange={setPage}
      />
    </>
  );

  const renderProposalForm = () => {
    if (selectedVenue.hasOvernightStay) {
      return (
        <PerDayProposalForm
          venueId={selectedVenue.id}
          onBack={handleBackToList}
        />
      );
    }
    return (
      <PerPersonProposalForm
        venueId={selectedVenue.id}
        onBack={handleBackToList}
      />
    );
  };

  if (!selectedVenue) {
    return (
      <div className="py-16 text-center text-gray-500">
        Carregando informações do espaço...
      </div>
    );
  }

  return (
    <DashboardLayout title="Orçamentos" subtitle="Gerencie seus orçamentos">
      {!selectedProposal ? (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={renderProposalList()}
          form={renderProposalForm()}
        />
      ) : (
        <div className="flex w-full">
          <BudgetSidebar
            onBack={handleCloseProposalDetails}
            proposal={selectedProposal}
          />
          <div className="flex-1 p-6">
            <BudgetDetails
              proposal={selectedProposal}
              onClose={handleCloseProposalDetails}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
