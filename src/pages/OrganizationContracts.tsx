
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizationContracts() {
  const { id: organizationId } = useParams<{ id: string }>();

  return (
    <DashboardLayout
      title="Contratos"
      subtitle="Gerencie contratos da organização"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Contratos da Organização
        </h2>
        <Button>
          Novo Contrato
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum contrato encontrado</h3>
        <p className="text-sm text-gray-500">
          Os contratos da organização serão exibidos aqui.
        </p>
      </div>
    </DashboardLayout>
  );
}
