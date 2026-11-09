import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar, Search } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { MonthYearNavigator } from "@/components/proposal/MonthYearNavigator";
import { ProposalTable } from "@/components/proposal/ProposalTable";
import { ProposalListPager } from "@/components/proposal/ProposalListPager";
import { ProposalListSummaryCards } from "@/components/proposal/ProposalListSummaryCards";
import { EventDetails } from "@/components/EventDetails";
import { EventSidebar } from "@/components/EventSidebar";

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type SortKey = "startDate" | "totalAmount" | "status";

function daysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export default function VenueEvents() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedVenue, fetchVenueById } = useVenueStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | "">("");
  const [amountFloorCommit, setAmountFloorCommit] = useState<number | null>(null);
  const [sliderDraft, setSliderDraft] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>("startDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { id: venueIdParam } = useParams();
  const { user } = useUserStore();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const showAmount = currentUserVenuePermission?.permissions?.includes("VIEW_AMOUNTS") ?? false;

  const {
    events,
    isLoadingEvents,
    eventListPagination,
    eventListSummary,
    eventListError,
    fetchEvents,
    fetchProposalById,
  } = useProposalStore();

  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
    navigate("/venue/events");
  };

  useEffect(() => {
    const eventId = searchParams.get("id");
    const action = searchParams.get("action");
    if (eventId && action === "view") {
      fetchProposalById(eventId);
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

  const amountFloor = typeof selectedVenue?.minimumPrice === "number" ? selectedVenue.minimumPrice : 0;
  const amountCeiling = eventListSummary?.amountMax ?? amountFloor;
  const sliderDisabled = eventListSummary == null || amountCeiling <= amountFloor;
  const sliderMax = amountCeiling > amountFloor ? amountCeiling : amountFloor + 1;
  const sliderShown = sliderDraft ?? amountFloorCommit ?? amountFloor;
  const minAmountFilter = amountFloorCommit != null && amountFloorCommit > amountFloor ? amountFloorCommit : undefined;

  const eventQuery = () => ({
    venueId: selectedVenue?.id ?? "",
    month: String(selectedMonth + 1),
    year: String(selectedYear),
    day: selectedDay === "" ? undefined : String(selectedDay),
    completeClientName: searchTerm || undefined,
    page: String(page),
    sortBy,
    sortDir,
    summary: true as const,
    minAmount: minAmountFilter,
  });

  useEffect(() => {
    if (!selectedVenue?.id) return;
    fetchEvents(eventQuery());
  }, [selectedVenue?.id, selectedMonth, selectedYear, selectedDay, searchTerm, page, sortBy, sortDir, minAmountFilter]);

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
    fetchEvents(eventQuery());
  };

  const renderEventList = () => (
    <>
      <div className="mb-6 rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
        <MonthYearNavigator
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          monthNames={monthNames}
          onYearChange={changeYear}
          onMonthChange={changeMonth}
          className="mb-4"
        />
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar eventos..."
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center">
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
          {showAmount && (
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
          )}
        </div>
        {showAmount && eventListSummary != null && amountCeiling <= amountFloor && (
          <p className="mt-2 text-xs text-muted-foreground">Não há valor acima do mínimo neste período.</p>
        )}
      </div>

      <div className="shrink-0">
        <ProposalListSummaryCards summary={eventListSummary} kind="events" showAmount={showAmount} />
      </div>

      <div className="mb-2 mt-4 text-sm text-muted-foreground">
        {eventListPagination?.total ?? eventListSummary?.total ?? 0} eventos
      </div>

      {eventListError && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{eventListError}</span>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Tentar de novo
          </Button>
        </div>
      )}

      <ProposalTable
        proposals={events}
        isLoading={isLoadingEvents}
        monthNames={monthNames}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={changeSort}
        kind="events"
        showAmount={showAmount}
      />
      <ProposalListPager
        page={eventListPagination?.page ?? page}
        totalPages={eventListPagination?.totalPages ?? 0}
        onPageChange={setPage}
      />
    </>
  );

  if (!selectedVenue) {
    return (
      <div className="py-16 text-center text-gray-500">
        Carregando informações do espaço...
      </div>
    );
  }

  return (
    <DashboardLayout title="Eventos" subtitle="Gerencie seus eventos">
      {!selectedEvent ? (
        renderEventList()
      ) : (
        <div className="flex w-full">
          <EventSidebar
            onBack={handleCloseEventDetails}
            event={selectedEvent}
          />
          <div className="flex-1 p-6">
            <EventDetails
              event={selectedEvent}
              onClose={handleCloseEventDetails}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
