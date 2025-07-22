import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { Skeleton } from "@/components/ui/skeleton";
import { EditOrganizationForm } from "@/components/organization/EditOrganizationForm";
import { useOrganizationStore } from "@/store/organizationStore";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import AccessDenied from "@/components/accessDenied";

export default function OrganizationSettings() {
  const { toast } = useToast();
  const { id: organizationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { currentOrganization, fetchOrganizationById, isLoading } = useOrganizationStore();
  const { currentUserOrganizationPermission } = useUserOrganizationPermissionStore();
  useEffect(() => {
    if (organizationId) {
      fetchOrganizationById(organizationId);
    }
  }, [organizationId, fetchOrganizationById]);

  const handleSuccess = () => {
    navigate("/dashboard");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading || !currentOrganization) {
    return (
      <DashboardLayout
        title="Configurações"
        subtitle="Gerencie as configurações da sua organização"
      >
        <div className="space-y-6 mx-auto mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-6">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
 
  return (
    <DashboardLayout
      title="Configurações"
      subtitle="Gerencie as configurações da sua organização"
    >
      <div className="max-w-2xl mx-auto mt-8">
        <EditOrganizationForm
          organizationId={organizationId}
          organization={currentOrganization}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </div>
    </DashboardLayout>
  );
} 