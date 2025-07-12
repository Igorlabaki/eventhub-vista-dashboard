import { PageHeader } from "@/components/ui/page-header";
import React from "react";

interface ContactHeaderProps {
  activeTab: string;
  hasPermission: boolean;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen: boolean;
}

export function ContactHeader({
  activeTab,
  onTabChange,
  hasPermission,
  onActionClick,
  isFormOpen = false,
}: ContactHeaderProps) {
  const tabs = [
    { value: "all", label: "TODOS" },
    { value: "internal", label: "EQUIPE" },
    { value: "supplier", label: "FORNECEDORES" },
  ];

  return (
    <PageHeader
      tabs={tabs}
      hasPermission={hasPermission}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onActionClick={onActionClick}
      isFormOpen={isFormOpen}
      actionButtonLabel="Novo Contato"
    />
  );
} 