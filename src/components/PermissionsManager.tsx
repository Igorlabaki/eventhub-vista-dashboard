
import { useState } from "react";
import { Users, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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

const mockPermissions = [
  { id: "1", name: "Eventos" },
  { id: "2", name: "Documentos" },
  { id: "3", name: "Orçamentos" },
  { id: "4", name: "Programação do evento" },
  { id: "5", name: "Pagamento" },
  { id: "6", name: "Datas" },
  { id: "7", name: "Enviar (orç, contratos, msg)" },
  { id: "8", name: "Lista de presença" }
];

// Mock user permissions
const mockUserPermissions = {
  "1": {
    "4": ["4", "8"] // Lucas has permissions 4 and 8 in venue 4 (Ar756)
  },
  "2": {
    "1": ["1", "2", "3"],
    "2": ["1", "2", "3", "4"]
  },
  "3": {
    "3": ["1"]
  }
};

interface PermissionsManagerProps {
  organizationId: string;
  open: boolean;
  onClose: () => void;
}

export function PermissionsManager({ organizationId, open, onClose }: PermissionsManagerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<typeof mockVenues[0] | null>(null);
  const [userPermissions, setUserPermissions] = useState(mockUserPermissions);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  const filteredUsers = mockUsers.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setVenueDialogOpen(true);
  };

  const handleVenueClick = (venue: typeof mockVenues[0]) => {
    setSelectedVenue(venue);
    setPermissionDialogOpen(true);
  };

  const togglePermission = (permissionId: string) => {
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
      const permissionIndex = venuePermissions.indexOf(permissionId);
      
      if (permissionIndex >= 0) {
        venuePermissions.splice(permissionIndex, 1);
      } else {
        venuePermissions.push(permissionId);
      }
      
      return newPermissions;
    });

    toast({
      title: "Permissões atualizadas",
      description: "As permissões do usuário foram atualizadas com sucesso."
    });
  };

  const hasPermission = (userId: string, venueId: string, permissionId: string): boolean => {
    return Boolean(
      userPermissions[userId] && 
      userPermissions[userId][venueId] && 
      userPermissions[userId][venueId].includes(permissionId)
    );
  };

  const handleSavePermissions = () => {
    setPermissionDialogOpen(false);
    toast({
      title: "Permissões salvas",
      description: "As permissões do usuário foram salvas com sucesso."
    });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Permissões
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Filtrar usuários..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            ))
          )}
        </div>
      </DialogContent>

      {/* Venue Selection Dialog */}
      {selectedUser && (
        <Dialog open={venueDialogOpen} onOpenChange={setVenueDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Permissões: {selectedUser.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">
                Selecione um espaço para gerenciar as permissões:
              </div>
              
              <div className="space-y-2">
                {mockVenues.map((venue) => {
                  const hasAnyPermissions = userPermissions[selectedUser.id] && 
                                           userPermissions[selectedUser.id][venue.id] &&
                                           userPermissions[selectedUser.id][venue.id].length > 0;
                  
                  return (
                    <div 
                      key={venue.id}
                      onClick={() => handleVenueClick(venue)}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <span>{venue.name}</span>
                      {hasAnyPermissions && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-2 py-1">
                          COM PERMISSÕES
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Permission Management Dialog */}
      {selectedUser && selectedVenue && (
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Permissões: {selectedVenue.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-2">
              <div className="text-sm text-gray-500 mb-4">
                Gerenciar permissões de {selectedUser.name} para {selectedVenue.name}:
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="text-sm font-medium">Permissões de Eventos / Orçamentos:</div>
                
                {mockPermissions.map((permission) => {
                  const isActive = hasPermission(selectedUser.id, selectedVenue.id, permission.id);
                  
                  return (
                    <div 
                      key={permission.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span>{permission.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={isActive ? "text-green-600" : "text-gray-400"}
                        onClick={() => togglePermission(permission.id)}
                      >
                        {isActive ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6">
                <Button className="w-full" onClick={handleSavePermissions}>
                  Atualizar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
