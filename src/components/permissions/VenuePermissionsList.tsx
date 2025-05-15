import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Venue } from "@/components/ui/venue-list";
import { FilterList } from "@/components/filterList";

interface VenuePermissionsListProps {
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
  onBackClick: () => void;
  userPermissions: {
    [venueId: string]: string[];
  };
  title?: string;
  subtitle?: string;
}

export function VenuePermissionsList({
  venues,
  onVenueClick,
  onBackClick,
  userPermissions,
  title,
  subtitle
}: VenuePermissionsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackClick}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {title && (
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
        )}
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 mb-4">
          {subtitle}
        </p>
      )}

      <FilterList
        items={venues}
        filterBy={(venue, query) => 
          venue.name.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar espaço..."
      >
        {(filteredVenues) => (
          <Table className="bg-white rounded-md shadow-lg">
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Espaço</TableHead>
                <TableHead className="w-[100px]">Permissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.map((venue) => {
                console.log("userPermissions", userPermissions)
                const permissions = userPermissions[venue.id] || [];
                const isAdmin = permissions.some(permission => permission === "admin");
                return (
                  <TableRow 
                    key={venue.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onVenueClick(venue)}
                  >
                    <TableCell className="font-medium">
                      {venue.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {permissions.length > 0 ? (
                        <span className={cn(
                          "text-xs font-medium rounded-full px-2 py-1",
                          isAdmin 
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        )}>
                          {isAdmin ? "ADMIN" : "USER"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                         ---
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </FilterList>
    </div>
  );
} 