import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
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
  if (activeTab === "panel") return null;

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Button
          variant="ghost"
          className="w-fit gap-2 px-2 text-[12px] md:text-sm font-semibold text-slate-600 hover:text-violet-700"
          onClick={() => onTabChange("panel")}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Button>
        {!isFormOpen && (
          <Button
            className="
              bg-eventhub-primary hover:bg-indigo-600 text-white md:my-0
              font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:flex
               md:w-auto text-[12px] md:text-sm hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={onActionClick}
          >
            <Plus className="w-7 h-7" />
            {activeTab === "metas"
              ? "Nova Meta"
              : activeTab === "adicionais"
              ? "Novo Adicional"
              : activeTab === "minimos"
              ? "Nova faixa"
              : "Novo Desconto"}
          </Button>
        )}
      </div>
      {/* Botão flutuante mobile */}
      {!isFormOpen && (
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-eventhub-primary hover:bg-indigo-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
          onClick={onActionClick}
          aria-label={
            activeTab === "metas"
              ? "Nova Meta"
              : activeTab === "adicionais"
              ? "Novo Adicional"
              : activeTab === "minimos"
              ? "Nova faixa"
              : "Novo Desconto"
          }
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
} 