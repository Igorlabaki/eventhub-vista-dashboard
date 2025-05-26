
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserList, User } from "@/components/ui/user-list";
import { VenueList, Venue } from "@/components/ui/venue-list";
import { PermissionManager } from "@/components/permissions/permission-manager";
import { userViewPermissions, userEditPermissions, userProposalPermissions } from "@/types/permissions";

// Mock data
const mockUsers = [
  { id: "1", name: "Lucas (Segurança)", email: "lucas@example.com" },
  { id: "2", name: "Maria (Administração)", email: "maria@example.com" },
  { id: "3", name: "João (Manutenção)", email: "joao@example.com" }
];

const mockVenues = [
  { id: "1", name: "Espaço Villa Verde" },
  { id: "2", name: "Casa de Festas Diamante" },
  { id: "3", name: "Salão Nobre" },
  { id: "4", name: "Ar756" }
];

// Mock user permissions
const mockUserPermissions = {
  "1": {
    "4": ["VIEW_CALENDAR", "EDIT_ATTENDANCE_LIST", "EDIT_SCHEDULE"] // Lucas has permissions 4 and 8 in venue 4 (Ar756)
  },
  "2": {
    "1": ["VIEW_EVENTS", "VIEW_INFO", "EDIT_TEXTS"],
    "2": ["VIEW_EVENTS", "VIEW_INFO", "VIEW_PROPOSALS", "EDIT_PROPOSALS"]
  },
  "3": {
    "3": ["VIEW_EVENTS"]
  }
};

interface PermissionsManagerProps {
  organizationId: string;
  open: boolean;
  onClose: () => void;
}

export function PermissionsManager({ organizationId, open, onClose }: PermissionsManagerProps) {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [userPermissions, setUserPermissions] = useState(mockUserPermissions);
  const [view, setView] = useState<"users" | "venues" | "permissions">("users");

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setView("venues");
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setView("permissions");
  };

  const handleSavePermissions = (newPermissions: string[]) => {
    if (!selectedUser || !selectedVenue) return;
    
    setUserPermissions(prev => {
      const updated = { ...prev };
      
      // Initialize if needed
      if (!updated[selectedUser.id]) {
        updated[selectedUser.id] = {};
      }
      
      // Update permissions
      updated[selectedUser.id][selectedVenue.id] = newPermissions;
      
      return updated;
    });
    
    setView("venues");
    
    toast({
      title: "Permissões atualizadas",
      description: "As permissões do usuário foram atualizadas com sucesso."
    });
  };

  const goBack = () => {
    if (view === "venues") {
      setView("users");
      setSelectedUser(null);
    } else if (view === "permissions") {
      setView("venues");
      setSelectedVenue(null);
    }
  };

  if (!open) return null;

  // Render the appropriate view based on state
  const renderContent = () => {
    // Users list view
    if (view === "users") {
      return (
        <UserList 
          users={mockUsers}
          onUserClick={handleUserClick}
          renderBadge={(user) => {
            const hasAnyPermission = Object.keys(userPermissions).includes(user.id) && 
                                   Object.keys(userPermissions[user.id] || {}).length > 0;
            
            return hasAnyPermission ? (
              <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-2 py-1">
                COM PERMISSÕES
              </span>
            ) : null;
          }}
        />
      );
    }
    
    // Venues list view
    if (view === "venues" && selectedUser) {
      return (
        <VenueList
          venues={mockVenues}
          onVenueClick={handleVenueClick}
          title={`Permissões para ${selectedUser.name}`}
          subtitle="Selecione um espaço para gerenciar as permissões:"
          renderBadge={(venue) => {
            const hasAnyPermissions = userPermissions[selectedUser.id] && 
                                    userPermissions[selectedUser.id][venue.id] &&
                                    userPermissions[selectedUser.id][venue.id].length > 0;
            
            return hasAnyPermissions ? (
              <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-2 py-1">
                COM PERMISSÕES
              </span>
            ) : null;
          }}
        />
      );
    }
    
    // Permissions management view
    if (view === "permissions" && selectedUser && selectedVenue) {
      return (
        <PermissionManager
          userId={selectedUser.id}
          userName={selectedUser.name}
          venueId={selectedVenue.id}
          venueName={selectedVenue.name}
          viewPermissions={userViewPermissions}
          editPermissions={userEditPermissions}
          proposalPermissions={userProposalPermissions}
          userPermissions={userPermissions}
          onGoBack={goBack}
          onSavePermissions={handleSavePermissions}
        />
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {view === "users" ? "Permissões" : 
             view === "venues" ? `Permissões: ${selectedUser?.name}` : 
             `Permissões: ${selectedVenue?.name}`}
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
