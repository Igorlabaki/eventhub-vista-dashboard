import { PageHeader } from "@/components/ui/page-header";
import React from "react";

interface ContractHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen: boolean;
}

export function ContractHeader({
  activeTab,
  onTabChange,
  onActionClick,
  isFormOpen = false,
}: ContractHeaderProps) {
  const tabs = [
    { value: "clausulas", label: "CLÁUSULAS" },
    { value: "anexos", label: "ANEXOS" },
    { value: "contratos", label: "CONTRATOS" },
  ];

  const getActionButtonLabel = () => {
    switch (activeTab) {
      case "clausulas":
        return "Nova Cláusula";
      case "anexos":
        return "Novo Anexo";
      default:
        return "Novo Contrato";
    }
  };

  return (
    <PageHeader
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onActionClick={onActionClick}
      isFormOpen={isFormOpen}
      actionButtonLabel={getActionButtonLabel()}
    />
  );
}
