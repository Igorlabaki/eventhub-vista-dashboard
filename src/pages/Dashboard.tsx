
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrganizationCard } from "@/components/OrganizationCard";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dados mock para demonstração
const mockOrganizations = [
  {
    id: "1",
    name: "Best Eventos Ltda",
    venueCount: 3,
    nextEvent: {
      name: "Casamento Silva",
      date: "2023-06-15",
    },
  },
  {
    id: "2",
    name: "Festa & Cia",
    venueCount: 2,
    nextEvent: {
      name: "Aniversário 15 anos",
      date: "2023-06-20",
    },
  },
  {
    id: "3",
    name: "Central de Eventos",
    venueCount: 5,
    nextEvent: {
      name: "Congresso de Medicina",
      date: "2023-07-01",
    },
  },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState(mockOrganizations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrganization, setNewOrganization] = useState({
    name: "",
  });

  const handleCreateOrganization = () => {
    if (!newOrganization.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da organização é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const newOrg = {
      id: `org-${Date.now()}`,
      name: newOrganization.name,
      venueCount: 0,
    };

    setOrganizations([...organizations, newOrg]);
    setNewOrganization({ name: "" });
    setDialogOpen(false);

    toast({
      title: "Sucesso",
      description: "Organização criada com sucesso",
    });
  };

  return (
    <DashboardLayout title="Organizações" subtitle="Gerencie suas organizações">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Suas Organizações ({organizations.length})
        </h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Organização
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <OrganizationCard
            key={org.id}
            id={org.id}
            name={org.name}
            venueCount={org.venueCount}
            nextEvent={org.nextEvent}
          />
        ))}
      </div>

      {/* Dialog para criar nova organização */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Organização</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Organização</Label>
              <Input
                id="name"
                placeholder="Digite o nome da organização"
                value={newOrganization.name}
                onChange={(e) =>
                  setNewOrganization({ ...newOrganization, name: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrganization}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
