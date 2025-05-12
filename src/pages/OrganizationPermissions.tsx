
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Check, X, ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Permissions, userViewPermissions, userEditPermissions, userProposalPermissions } from "@/types/permissions";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<typeof mockVenues[0] | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissionState>(mockUserPermissions);
  const [view, setView] = useState<"users" | "venues" | "permissions">("users");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  // Form for adding new user
  const addUserForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: ""
    }
  });

  const filteredUsers = mockUsers.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setView("venues");
  };

  const handleVenueClick = (venue: typeof mockVenues[0]) => {
    setSelectedVenue(venue);
    setView("permissions");
  };

  const togglePermission = (permissionKey: string) => {
    if (!selectedUser || !selectedVenue) return;
    
    const userId = selectedUser.id;
    const venueId = selectedVenue.id;
    
    setUserPermissions(prev => {
      const newPermissions = { ...prev };
      
      // Initialize if needed
      if (!newPermissions[userId]) {
        newPermissions[userId] = {};
      }
      
      if (!newPermissions[userId][venueId]) {
        newPermissions[userId][venueId] = [];
      }
      
      // Toggle permission
      const venuePermissions = newPermissions[userId][venueId];
      const permissionIndex = venuePermissions.indexOf(permissionKey);
      
      if (permissionIndex >= 0) {
        venuePermissions.splice(permissionIndex, 1);
      } else {
        venuePermissions.push(permissionKey);
      }
      
      return newPermissions;
    });
  };

  const hasPermission = (userId: string, venueId: string, permissionKey: string): boolean => {
    return Boolean(
      userPermissions[userId] && 
      userPermissions[userId][venueId] && 
      userPermissions[userId][venueId].includes(permissionKey)
    );
  };

  const handleSavePermissions = () => {
    toast({
      title: "Permissões atualizadas",
      description: "As permissões do usuário foram atualizadas com sucesso."
    });
    setView("venues");
  };

  const handleAddUser = (data: AddUserFormValues) => {
    // In a real application, this would connect to your backend
    // For now, we'll simulate adding a new user with a mock
    
    const newUserId = `${mockUsers.length + 1}`;
    const newUser = {
      id: newUserId,
      name: `Novo Usuário (${data.email})`,
      email: data.email
    };
    
    // Add the new user to our mock data
    mockUsers.push(newUser);
    
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
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Filtrar usuários..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado
              </div>
            ) : (
              filteredUsers.map((user) => {
                const hasAnyPermission = Object.keys(userPermissions).includes(user.id) && 
                                       Object.keys(userPermissions[user.id] || {}).length > 0;
                
                return (
                  <div 
                    key={user.id} 
                    className="p-4 border rounded-lg bg-white hover:shadow transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      {hasAnyPermission && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-2 py-1">
                          COM PERMISSÕES
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      );
    }
    
    // Venues list view
    if (view === "venues" && selectedUser) {
      return (
        <>
          <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" className="mr-2" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">
              Permissões para {selectedUser.name}
            </h2>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Selecione um espaço para gerenciar as permissões:
          </p>
          
          <div className="space-y-3">
            {mockVenues.map((venue) => {
              const hasAnyPermissions = userPermissions[selectedUser.id] && 
                                      userPermissions[selectedUser.id][venue.id] &&
                                      userPermissions[selectedUser.id][venue.id].length > 0;
              
              return (
                <Card 
                  key={venue.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleVenueClick(venue)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-medium">{venue.name}</span>
                    {hasAnyPermissions && (
                      <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-2 py-1">
                        COM PERMISSÕES
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      );
    }
    
    // Permissions management view
    if (view === "permissions" && selectedUser && selectedVenue) {
      const userId = selectedUser.id;
      const venueId = selectedVenue.id;

      return (
        <>
          <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" className="mr-2" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Permissões: {selectedVenue.name}
              </h2>
              <p className="text-sm text-gray-500">
                Gerenciar permissões de {selectedUser.name}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* View Permissions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Permissões de Visualização:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userViewPermissions.map((permission) => (
                  <div 
                    key={permission.enum}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <span>{permission.display}</span>
                    <RadioGroup 
                      value={hasPermission(userId, venueId, permission.enum) ? "enabled" : "disabled"}
                      onValueChange={(value) => {
                        if (value === "enabled" && !hasPermission(userId, venueId, permission.enum)) {
                          togglePermission(permission.enum);
                        } else if (value === "disabled" && hasPermission(userId, venueId, permission.enum)) {
                          togglePermission(permission.enum);
                        }
                      }}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="disabled" id={`${permission.enum}-disabled`} />
                        <Label htmlFor={`${permission.enum}-disabled`} className="text-gray-500">Não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enabled" id={`${permission.enum}-enabled`} />
                        <Label htmlFor={`${permission.enum}-enabled`} className="text-gray-500">Sim</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Edit Permissions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Permissões de Edição:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userEditPermissions.map((permission) => (
                  <div 
                    key={permission.enum}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <span>{permission.display}</span>
                    <RadioGroup 
                      value={hasPermission(userId, venueId, permission.enum) ? "enabled" : "disabled"}
                      onValueChange={(value) => {
                        if (value === "enabled" && !hasPermission(userId, venueId, permission.enum)) {
                          togglePermission(permission.enum);
                        } else if (value === "disabled" && hasPermission(userId, venueId, permission.enum)) {
                          togglePermission(permission.enum);
                        }
                      }}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="disabled" id={`${permission.enum}-disabled`} />
                        <Label htmlFor={`${permission.enum}-disabled`} className="text-gray-500">Não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enabled" id={`${permission.enum}-enabled`} />
                        <Label htmlFor={`${permission.enum}-enabled`} className="text-gray-500">Sim</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Proposal Permissions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Permissões de Eventos / Orçamentos:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userProposalPermissions.map((permission) => (
                  <div 
                    key={permission.enum}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <span>{permission.display}</span>
                    <RadioGroup 
                      value={hasPermission(userId, venueId, permission.enum) ? "enabled" : "disabled"}
                      onValueChange={(value) => {
                        if (value === "enabled" && !hasPermission(userId, venueId, permission.enum)) {
                          togglePermission(permission.enum);
                        } else if (value === "disabled" && hasPermission(userId, venueId, permission.enum)) {
                          togglePermission(permission.enum);
                        }
                      }}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="disabled" id={`${permission.enum}-disabled`} />
                        <Label htmlFor={`${permission.enum}-disabled`} className="text-gray-500">Não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enabled" id={`${permission.enum}-enabled`} />
                        <Label htmlFor={`${permission.enum}-enabled`} className="text-gray-500">Sim</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Button className="w-full" onClick={handleSavePermissions}>
                Atualizar
              </Button>
            </div>
          </div>
        </>
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
