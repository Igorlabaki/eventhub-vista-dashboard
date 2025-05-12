
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";

export default function VenueOwners() {
  const [owners, setOwners] = useState([
    { id: "1", name: "João Silva", email: "joao@example.com", role: "Proprietário Principal", phone: "(11) 98765-4321" },
    { id: "2", name: "Maria Oliveira", email: "maria@example.com", role: "Co-Proprietário", phone: "(11) 91234-5678" },
  ]);

  return (
    <DashboardLayout title="Proprietários" subtitle="Gerencie os proprietários do espaço">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Proprietários do Espaço
        </h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Proprietário
        </Button>
      </div>
      
      <div className="grid gap-4">
        {owners.map((owner) => (
          <Card key={owner.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-eventhub-tertiary/20 flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-eventhub-primary" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{owner.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1">
                    <span>{owner.email}</span>
                    <span className="hidden sm:inline mx-2">•</span>
                    <span>{owner.phone}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-eventhub-tertiary/20 text-eventhub-primary">
                    {owner.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {owners.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum proprietário cadastrado.</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Proprietário
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
