
import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OwnersManager } from "@/components/OwnersManager";

export default function VenueOwners() {
  const { id } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(true); // Iniciar com o modal aberto
  
  // Aqui assumimos que o ID do espaço pode ser usado para identificar a organização
  // Em um cenário real, você provavelmente teria que buscar o organizationId correspondente
  const organizationId = id || "1";

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <DashboardLayout title="Proprietários" subtitle="Gerencie os proprietários do espaço">
      <OwnersManager
        organizationId={organizationId}
        open={isOpen}
        onClose={handleClose}
      />
    </DashboardLayout>
  );
}
