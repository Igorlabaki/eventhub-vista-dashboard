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
  onVenueClick: (venue: Venue, venuePermission: {
    id: string;
    permissions: string[];
    role: string;
  }) => void;
  userVenuePermissions: {
    [venueId: string]: {
      id: string;
      permissions: string[];
      role: string;
    };
  };
}

export function VenuePermissionsList({
  venues,
  onVenueClick,
  userVenuePermissions,
}: VenuePermissionsListProps) {
  return (
    <div className="">
      <FilterList
        items={venues}
        filterBy={(venue, query) => 
          venue.name.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar espaço..."
      >
        {(filteredVenues) => (
          <Table className=" shadow-lg">
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Espaço</TableHead>
                <TableHead className="w-[100px]">Permissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.map((venue) => {
                const venuePermission = userVenuePermissions[venue.id];
                const permissions = venuePermission?.permissions || [];
                const role = venuePermission?.role;
                // Verifica se é admin baseado na role
                const isAdmin = role === "admin";
                return (
                  <TableRow 
                    key={venue.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onVenueClick(venue,  venuePermission)}
                  >
                    <TableCell className="font-medium">
                      {venue.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {role ? (
                        <span className={cn(
                          "text-xs font-medium rounded-full px-2 py-1",
                          isAdmin 
                            ? "bg-green-100 text-green-800"
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