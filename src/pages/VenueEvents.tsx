import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { EventTable } from "@/components/events/EventTable";
import { EventMonthYearNavigator } from "@/components/events/EventMonthYearNavigator";
import { EventDetails } from "@/components/EventDetails";
import { EventSidebar } from "@/components/EventSidebar";
import { ProposalListPager } from "@/components/proposal/ProposalListPager";

// Month names in Portuguese
const monthNames = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function VenueEvents() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedVenue } = useVenueStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const {
    events,
    isLoadingEvents,
    eventListPagination,
    eventListError,
    fetchEvents,
    fetchProposalById,
  } = useProposalStore();

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

  useEffect(() => {
    if (!selectedVenue?.id) return;
    fetchEvents({
      venueId: selectedVenue.id,
      month: (selectedMonth + 1).toString(),
      year: selectedYear.toString(),
      completeClientName: searchTerm || undefined,
      page: String(page),
    });
  }, [selectedVenue?.id, selectedMonth, selectedYear, searchTerm, page]);

 // Handle opening event details
  const handleOpenEventDetails = (event) => {
    navigate(`/proposal/${event.id}`);
  };

  // Close event details
  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
    navigate("/venue/events");
  };

  // Effect to handle URL parameters
 

  const renderEventList = () => (
    <>
      <EventMonthYearNavigator
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        monthNames={monthNames}
        onYearChange={(year) => {
          setSelectedYear(year);
          setPage(1);
        }}
        onMonthChange={(month) => {
          setSelectedMonth(month);
          setPage(1);
        }}
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar eventos..."
          className="bg-white pl-9"
        />
      </div>
      <div className="mb-2 text-sm text-gray-500">
        {eventListPagination?.total ?? 0} eventos
      </div>
      {eventListError && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {eventListError}
        </div>
      )}
      <EventTable
        events={events}
        isLoading={isLoadingEvents}
        onEventClick={handleOpenEventDetails}
        monthNames={monthNames}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
      <ProposalListPager
        page={eventListPagination?.page ?? page}
        totalPages={eventListPagination?.totalPages ?? 0}
        onPageChange={setPage}
      />
    </>
  );

  return (
    <DashboardLayout title="Eventos" subtitle="Gerencie seus eventos">
      {!selectedEvent ? (
        <>{renderEventList()}</>
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
