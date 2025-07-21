import { PageHeader } from "@/components/ui/page-header";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import React from "react";

interface ExpenseHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen: boolean;
}

export function ExpenseHeader({
  activeTab,
  onTabChange,
  onActionClick,
  isFormOpen = false,
}: ExpenseHeaderProps) {
  const tabs = [
    { value: "recorrentes", label: "RECORRENTES" },
    { value: "esporadicas", label: "ESPORÁDICAS" },
  ];

  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_VENUE_EXPENSES"
    );
  };

  return (
    <PageHeader
      hasPermission={hasEditPermission()}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onActionClick={onActionClick}
      isFormOpen={isFormOpen}
      actionButtonLabel="Nova Despesa"
    />
  );
} 