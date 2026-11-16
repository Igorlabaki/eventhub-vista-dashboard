import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DateEvent } from "@/types/date-event";
import { wallClockDateTimeBr } from "@/lib/wall-clock-datetime";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useUserStore } from "@/store/userStore";
import { venueCardBrand } from "@/lib/venue-card-brand";

export interface VenueCardProps {
  id: string;
  name: string;
  nextEvent: DateEvent | null;
  upcomingEvents: number;
  organizationId: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  textColor?: string | null;
  onEditClick?: () => void;
}

export function VenueCard({
  id,
  name,
  nextEvent,
  organizationId,
  logoUrl,
  primaryColor,
  secondaryColor,
  textColor,
}: VenueCardProps) {
  const navigate = useNavigate();
  const { fetchCurrentUserVenuePermission } = useUserVenuePermissionStore();
  const { user } = useUserStore();
  const [logoFailed, setLogoFailed] = useState(false);
  const brand = venueCardBrand({ primaryColor, secondaryColor, textColor });
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const mutedText = brand ? "opacity-75" : "text-gray-500";
  const emptyText = brand ? "opacity-60" : "text-gray-400";

  const handleViewVenue = async () => {
    await fetchCurrentUserVenuePermission({
      organizationId: organizationId,
      userId: user?.id || "",
      venueId: id,
    });
    navigate(`/venue/${id}/notifications`);
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`Gerenciar ${name}`}
      onClick={handleViewVenue}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleViewVenue();
        }
      }}
      className={`eventhub-card border-l-4 border-l-eventhub-primary cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventhub-primary ${
        brand ? "hover:brightness-95" : ""
      }`}
      style={brand?.card}
    >
      <CardHeader className="flex flex-row items-center justify-between mb-4 pb-2">
        <CardTitle className="text-sm font-medium">
          {showLogo ? (
            <img
              src={logoUrl ?? undefined}
              alt={name}
              className="max-h-12 max-w-[160px] object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            name
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="eventhub-stat" style={brand?.inner}>
          <div className="flex items-center gap-1">
            <Users className={`h-3 w-3 ${mutedText}`} />
            <span className={`text-xs ${mutedText}`}>Próxima data</span>
          </div>
          {nextEvent ? (
            <div className="flex items-center justify-between p-3">
              <span className="text-[13px] md:text-sm font-semibold ">
                {nextEvent.title}
              </span>
              <span className="text-sm font-semibold">
                {wallClockDateTimeBr(nextEvent.startDate)}
              </span>
            </div>
          ) : (
            <span className={`text-[13px] md:text-sm ${emptyText}  p-3`}>
              Nenhuma data agendada
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
