import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { EventTable } from "@/components/events/EventTable";
import { EventMonthYearNavigator } from "@/components/events/EventMonthYearNavigator";
import { EventDetails } from "@/components/EventDetails";
import { EventSidebar } from "@/components/EventSidebar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { EventFilterList } from "@/components/events/EventFilterList";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import AccessDenied from "@/components/accessDenied";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedVenue } = useVenueStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const { events, isLoading, error, fetchEvents, fetchProposalById } =
    useProposalStore();

  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  useEffect(() => {
    const eventId = searchParams.get("id");
    const action = searchParams.get("action");

    if (eventId && action === "view") {
      fetchProposalById(eventId);
    }
  }, [searchParams]);

  // Effect to fetch events when month/year changes
  useEffect(() => {
    fetchEvents({
      venueId: selectedVenue.id,
      month: (selectedMonth + 1).toString(),
      year: selectedYear.toString(),
    });
  }, [selectedMonth, selectedYear]);

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
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      <EventFilterList
        items={events.filter(
          (event) =>
            new Date(event.startDate).getMonth() === selectedMonth &&
            new Date(event.startDate).getFullYear() === selectedYear
        )}
        filterBy={(event, query) =>
          event.completeClientName.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar eventos..."
      >
        {(filteredEvents) => (
          <>
            <div className="mb-2 text-sm text-gray-500">
              {filteredEvents.length} eventos
            </div>
            <EventTable
              events={filteredEvents}
              isLoading={isLoading}
              onEventClick={handleOpenEventDetails}
              monthNames={monthNames}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </>
        )}
      </EventFilterList>
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
