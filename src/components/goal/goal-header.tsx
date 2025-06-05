import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import React from "react";

interface GoalHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen: boolean;
}

export function GoalHeader({
  activeTab,
  onTabChange,
  onActionClick,
  isFormOpen = false,
}: GoalHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1">
            <TabsTrigger
              value="panel"
              className={
                `px-4 py-2 text-sm font-semibold transition-all duration-200
                ${activeTab === "panel"
                  ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                  : "border-b-4 border-transparent"}`
              }
            >
              PAINEL
            </TabsTrigger>
            <TabsTrigger
              value="metas"
              className={
                `px-4 py-2 text-sm font-semibold transition-all duration-200
                ${activeTab === "metas"
                  ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                  : "border-b-4 border-transparent"}`
              }
            >
              METAS
            </TabsTrigger>
            <TabsTrigger
              value="adicionais"
              className={
                `px-4 py-2 text-sm font-semibold transition-all duration-200
                ${activeTab === "adicionais"
                  ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                  : "border-b-4 border-transparent"}`
              }
            >
              ADICIONAIS
            </TabsTrigger>
            <TabsTrigger
              value="descontos"
              className={
                `px-4 py-2 text-sm font-semibold transition-all duration-200
                ${activeTab === "descontos"
                  ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                  : "border-b-4 border-transparent"}`
              }
            >
              DESCONTOS
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {!isFormOpen && activeTab !== "panel" && (
          <Button
            className="
              bg-eventhub-primary hover:bg-indigo-600 text-white md:my-0
              font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:flex
               md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={onActionClick}
          >
            <Plus className="w-7 h-7" />
            {activeTab === "metas"
              ? "Nova Meta"
              : activeTab === "adicionais"
              ? "Novo Adicional"
              : "Novo Desconto"}
          </Button>
        )}
      </div>
      {/* Botão flutuante mobile */}
      {!isFormOpen && activeTab !== "panel" && (
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-eventhub-primary hover:bg-indigo-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
          onClick={onActionClick}
          aria-label={
            activeTab === "metas"
              ? "Nova Meta"
              : activeTab === "adicionais"
              ? "Novo Adicional"
              : "Novo Desconto"
          }
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
} 