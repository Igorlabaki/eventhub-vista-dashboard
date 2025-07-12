import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

interface Tab {
  value: string;
  label: string;
}

interface PageHeaderProps {
  tabs: Tab[];
  activeTab: string;
  hasPermission: boolean;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen?: boolean;
  actionButtonLabel: string;
  actionButtonIcon?: React.ReactNode;
}

export function PageHeader({
  tabs,
  activeTab,
  onTabChange,
  hasPermission,
  onActionClick,
  isFormOpen = false,
  actionButtonLabel,
  actionButtonIcon = <Plus className="w-7 h-7" />,
}: PageHeaderProps) {
  return (
    <div className="mb-6 w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.value
                  ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                  : "border-b-4 border-transparent"
              }`}
              onClick={() => onTabChange(tab.value)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {!isFormOpen && hasPermission && (
          <Button
            className="shadow-lg flex-row items-center gap-2 bg-eventhub-primary hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 hidden md:flex"
            onClick={onActionClick}
          >
            {actionButtonIcon}
            <p>{actionButtonLabel}</p>
          </Button>
        )}
      </div>
      {/* Botão flutuante mobile via Portal para ficar sempre fixo no viewport */}
      {!isFormOpen && hasPermission && createPortal(
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-eventhub-primary hover:bg-indigo-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
          onClick={onActionClick}
          aria-label={actionButtonLabel}
        >
          {actionButtonIcon}
        </button>,
        document.body
      )}
    </div>
  );
} 