
import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { UserList, User } from "@/components/ui/user-list";
import { VenueList, Venue } from "@/components/ui/venue-list";
import { PermissionManager } from "@/components/ui/permission-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { userViewPermissions, userEditPermissions, userProposalPermissions } from "@/types/permissions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Mock users data
const mockUsers = [
  { id: "1", name: "Lucas (Segurança)", email: "lucas@example.com" },
  { id: "2", name: "Maria (Administração)", email: "maria@example.com" },
  { id: "3", name: "João (Manutenção)", email: "joao@example.com" }
];

// Mock venues data
const mockVenues = [
  { id: "1", name: "Espaço Villa Verde" },
  { id: "2", name: "Casa de Festas Diamante" },
  { id: "3", name: "Salão Nobre" },
  { id: "4", name: "Ar756" }
];

// Mock user permissions
const mockUserPermissions = {
  "1": {
    "4": ["VIEW_CALENDAR", "EDIT_ATTENDANCE_LIST", "EDIT_SCHEDULE"] // Lucas has these permissions in venue 4 (Ar756)
  },
  "2": {
    "1": ["VIEW_EVENTS", "VIEW_INFO", "EDIT_TEXTS"],
    "2": ["VIEW_EVENTS", "VIEW_INFO", "VIEW_PROPOSALS", "EDIT_PROPOSALS"]
  },
  "3": {
    "3": ["VIEW_EVENTS"]
  }
};

type UserPermissionState = {
  [userId: string]: {
    [venueId: string]: string[];
  }
}

// Schema for adding a new user
const addUserSchema = z.object({
  email: z.string().email("Email inválido")
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export default function OrganizationPermissions() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { toast } = useToast();

  // State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissionState>(mockUserPermissions);
  const [view, setView] = useState<"users" | "venues" | "permissions">("users");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Form for adding new user
  const addUserForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: ""
    }
  });

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
  };

  const handleAddUser = (data: AddUserFormValues) => {
    // In a real application, this would connect to your backend
    // For now, we'll simulate adding a new user with a mock
    
    const newUserId = `${users.length + 1}`;
    const newUser = {
      id: newUserId,
      name: `Novo Usuário (${data.email})`,
      email: data.email
    };
    
    // Add the new user to our mock data
    setUsers(prev => [...prev, newUser]);
    
    // Initialize empty permissions for this user
    setUserPermissions(prev => ({
      ...prev,
      [newUserId]: {}
    }));
    
    toast({
      title: "Usuário adicionado",
      description: `${data.email} foi adicionado à sua organização.`
    });
    
    setAddUserDialogOpen(false);
    addUserForm.reset();
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

  // Render the appropriate view based on state
  const renderContent = () => {
    // Users list view
    if (view === "users") {
      return (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Usuários com permissões
            </h2>
            <Button 
              onClick={() => setAddUserDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus size={18} />
              Adicionar Usuário
            </Button>
          </div>
          
          <UserList 
            users={users}
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
        </>
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
    <>
      <DashboardLayout
        title="Permissões"
        subtitle="Gerencie as permissões dos usuários"
      >
        {renderContent()}
      </DashboardLayout>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
          </DialogHeader>
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={addUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setAddUserDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Adicionar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
