
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OwnersManager } from "@/components/OwnersManager";

export default function VenueOwners() {
  const { id } = useParams<{ id: string }>();
  
  // Use the venue ID as organization ID (as in the previous implementation)
  const organizationId = id || "1";

  return (
    <DashboardLayout title="Proprietários" subtitle="Gerencie os proprietários do espaço">
      <OwnersManager
        organizationId={organizationId}
        open={true}
        onClose={() => {}}
        showInPage={true} // This prop will tell OwnersManager to render inline instead of in modal
      />
    </DashboardLayout>
  );
}
