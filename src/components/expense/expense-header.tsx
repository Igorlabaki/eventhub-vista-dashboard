import { PageHeader } from "@/components/ui/page-header";
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

  return (
    <PageHeader
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onActionClick={onActionClick}
      isFormOpen={isFormOpen}
      actionButtonLabel="Nova Despesa"
    />
  );
} 